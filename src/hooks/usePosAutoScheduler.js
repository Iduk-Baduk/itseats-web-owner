import { useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import posAPI from '../services/posAPI';
import { retryApiCall } from '../utils/errorHandler';
import { POS_STATUS } from '../constants/posStatus';
import { determineCurrentStatus, getNextStatusChangeDelay } from '../utils/posAutoScheduler';

/**
 * POS 자동화 스케줄러 훅
 * @param {Object} settings - 자동화 설정
 * @param {Function} onStatusChange - 상태 변경 콜백
 * @returns {Object} 스케줄러 컨트롤 함수들
 */
const usePosAutoScheduler = (settings, onStatusChange) => {
  /**
   * POS 상태 자동 업데이트
   * @param {string} status - 새로운 POS 상태
   */
  const autoUpdatePosStatus = useCallback(async (status) => {
    try {
      await posAPI.updatePosStatus(status);
      onStatusChange(status);
      toast.success(`POS 상태가 ${POS_STATUS.LABEL[status]}로 자동 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to auto-update POS status:', error);
      toast.error('POS 상태 자동 변경에 실패했습니다. 수동으로 변경해주세요.');
    }
  }, [onStatusChange]);

  useEffect(() => {
    let timeoutId;

    const scheduleNextUpdate = async () => {
      if (!settings || (!settings.autoOpen && !settings.autoClose)) {
        return;
      }

      const nextStatus = determineCurrentStatus(settings);
      if (nextStatus) {
        try {
          await autoUpdatePosStatus(nextStatus);
        } catch (error) {
          console.error('Failed to auto-update POS status:', error);
        }
      }

      // 다음 상태 변경 예약
      const delay = getNextStatusChangeDelay(settings);
      if (delay) {
        timeoutId = setTimeout(scheduleNextUpdate, delay);
      }
    };

    // 초기 상태 업데이트 즉시 실행
    if (settings && (settings.autoOpen || settings.autoClose)) {
      const initialStatus = determineCurrentStatus(settings);
      if (initialStatus) {
        onStatusChange(initialStatus);
      }
    }

    scheduleNextUpdate();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [settings, autoUpdatePosStatus, onStatusChange]);

  return {
    runScheduler: useCallback(() => {
      const nextStatus = determineCurrentStatus(settings);
      if (nextStatus) {
        onStatusChange(nextStatus);
      }
    }, [settings, onStatusChange])
  };
};

export default usePosAutoScheduler; 
