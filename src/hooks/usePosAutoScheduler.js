import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import posAPI from '../services/posAPI';
import { retryApiCall } from '../utils/errorHandler';
import { POS_STATUS, POS_STATUS_LABEL } from '../constants/posStatus';
import {
  determineCurrentStatus,
  getNextStatusChangeDelay,
} from '../utils/posAutoScheduler';

/**
 * POS 자동화 스케줄러 훅
 * @param {Object} settings - 자동화 설정
 * @param {Function} onStatusChange - 상태 변경 콜백
 * @returns {Object} 스케줄러 컨트롤 함수들
 */
const usePosAutoScheduler = (settings, onStatusChange) => {
  const stableOnStatusChange = useCallback(onStatusChange, []);
  const timeoutIdRef = useRef(null);
  const lastProcessedDateRef = useRef(null);

  /**
   * 오늘 날짜에 이미 자동 상태 변경이 처리되었는지 확인
   * @returns {boolean} 처리 여부
   */
  const hasProcessedToday = () => {
    const today = new Date().toDateString();
    const lastProcessed = localStorage.getItem('lastAutoStatusChangeDate');
    return lastProcessed === today;
  };

  /**
   * 오늘 날짜에 자동 상태 변경 처리 완료 표시
   */
  const markProcessedToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastAutoStatusChangeDate', today);
    lastProcessedDateRef.current = today;
  };

  /**
   * POS 상태 자동 업데이트
   * @param {string} status - 새로운 POS 상태
   */
  const autoUpdatePosStatus = useCallback(async (status) => {
    try {
      await posAPI.updatePosStatus(status);
      stableOnStatusChange(status);
      markProcessedToday();
      toast.success(`POS 상태가 ${POS_STATUS_LABEL[status]}로 자동 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to auto-update POS status:', error);
      toast.error('POS 상태 자동 변경에 실패했습니다. 수동으로 변경해주세요.');
    }
  }, [stableOnStatusChange]);

  useEffect(() => {
    // 기존 타이머 정리
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const scheduleNextUpdate = async () => {
      try {
        // 오늘 이미 처리되었으면 스킵
        if (hasProcessedToday()) {
          console.log('오늘 이미 자동 상태 변경이 처리되었습니다.');
          return;
        }

        const currentStatus = determineCurrentStatus(settings);
        if (currentStatus) {
          await posAPI.updatePosStatusWithNotification(settings.posId, {
            status: currentStatus,
            reason: `자동 상태 변경: ${currentStatus}`,
            category: 'AUTO',
          });
          stableOnStatusChange(currentStatus);
          markProcessedToday();
          toast.success(`POS 상태가 ${POS_STATUS_LABEL[currentStatus]}로 자동 변경되었습니다.`);
        }

        const delay = getNextStatusChangeDelay(settings);
        if (delay > 0) {
          timeoutIdRef.current = setTimeout(scheduleNextUpdate, delay);
        }
      } catch (error) {
        console.error('Failed to auto-update POS status:', error);
      }
    };

    if (settings && (settings.autoOpen || settings.autoClose)) {
      scheduleNextUpdate();
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [settings, stableOnStatusChange, autoUpdatePosStatus]);

  return {
    runScheduler: useCallback(() => {
      const nextStatus = determineCurrentStatus(settings);
      if (nextStatus) {
        stableOnStatusChange(nextStatus);
      }
    }, [settings, stableOnStatusChange]),
    
    resetDailyProcessing: useCallback(() => {
      localStorage.removeItem('lastAutoStatusChangeDate');
      lastProcessedDateRef.current = null;
      console.log('일일 자동 상태 변경 처리 기록이 초기화되었습니다.');
    }, [])
  };
};

export default usePosAutoScheduler; 
