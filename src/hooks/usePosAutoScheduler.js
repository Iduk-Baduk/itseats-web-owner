import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import posAPI from '../services/posAPI';
import { updatePosStatus } from '../store/posSlice';
import { retryApiCall } from '../utils/errorHandler';

/**
 * 특정 시간에 트리거해야 하는지 확인
 * @param {string} currentTime - 현재 시간 (HH:mm 형식)
 * @param {string} targetTime - 목표 시간 (HH:mm 형식)
 * @returns {boolean} 트리거 여부
 */
const shouldTriggerAtTime = (currentTime, targetTime) => {
  // 시간 형식 검증 (HH:mm)
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timePattern.test(currentTime) || !timePattern.test(targetTime)) {
    console.warn('Invalid time format provided to shouldTriggerAtTime');
    return false;
  }
  
  try {
    const current = new Date(`1970-01-01T${currentTime}:00`);
    const target = new Date(`1970-01-01T${targetTime}:00`);
    const diff = Math.abs(current.getTime() - target.getTime());
    return diff < 60000; // 1분 이내
  } catch (error) {
    console.error('Error comparing times:', error);
    return false;
  }
};

/**
 * POS 자동화 스케줄러 훅
 * @returns {Object} 스케줄러 컨트롤 함수들
 */
export const usePosAutoScheduler = () => {
  const dispatch = useDispatch();

  /**
   * POS 상태 자동 업데이트
   * @param {string} status - 새로운 POS 상태
   */
  const autoUpdatePosStatus = useCallback(async (status) => {
    try {
      const result = await retryApiCall(
        () => posAPI.updatePosStatus(status),
        3,  // 최대 3회 재시도
        1000 // 1초 간격
      );
      
      dispatch(updatePosStatus(result));
      toast.success(`POS 상태가 ${status}로 자동 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to auto-update POS status:', error);
      toast.error('POS 상태 자동 변경에 실패했습니다. 수동으로 변경해주세요.');
    }
  }, [dispatch]);

  /**
   * 자동화 설정에 따른 스케줄러 실행
   */
  const runScheduler = useCallback(async () => {
    try {
      const settings = await posAPI.getPosAutoSettings();
      if (!settings.autoOpen && !settings.autoClose) {
        return;
      }

      const now = new Date();
      const currentTime = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const isTimeToOpen = settings.autoOpen && 
        shouldTriggerAtTime(currentTime, settings.autoOpenTime);
      const isTimeToClose = settings.autoClose && 
        shouldTriggerAtTime(currentTime, settings.autoCloseTime);
      
      if (isTimeToOpen) {
        await autoUpdatePosStatus('OPEN');
      } else if (isTimeToClose) {
        await autoUpdatePosStatus('CLOSED');
      }
    } catch (error) {
      console.error('Failed to run POS auto scheduler:', error);
      toast.error('POS 자동화 설정을 불러오는데 실패했습니다.');
    }
  }, [autoUpdatePosStatus]);

  useEffect(() => {
    const intervalId = setInterval(runScheduler, 60000); // 1분마다 실행
    return () => clearInterval(intervalId);
  }, [runScheduler]);

  return {
    runScheduler
  };
}; 
