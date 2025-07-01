import { useEffect, useCallback } from 'react';
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

  /**
   * POS 상태 자동 업데이트
   * @param {string} status - 새로운 POS 상태
   */
  const autoUpdatePosStatus = useCallback(async (status) => {
    try {
      await posAPI.updatePosStatus(status);
      stableOnStatusChange(status);
      toast.success(`POS 상태가 ${POS_STATUS_LABEL[status]}로 자동 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to auto-update POS status:', error);
      toast.error('POS 상태 자동 변경에 실패했습니다. 수동으로 변경해주세요.');
    }
  }, [stableOnStatusChange]);

  useEffect(() => {
    let timeoutId = null;

    const scheduleNextUpdate = async () => {
      try {
        const currentStatus = determineCurrentStatus(settings);
        if (currentStatus) {
          stableOnStatusChange(currentStatus);
          await posAPI.updatePosStatusWithNotification(settings.posId, {
            status: currentStatus,
            reason: `자동 상태 변경: ${currentStatus}`,
            category: 'AUTO',
          });
        }

        const delay = getNextStatusChangeDelay(settings);
        if (delay > 0) {
          timeoutId = setTimeout(scheduleNextUpdate, delay);
        }
      } catch (error) {
        console.error('Failed to auto-update POS status:', error);
      }
    };

    if (settings && (settings.autoOpen || settings.autoClose)) {
      scheduleNextUpdate();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [settings, stableOnStatusChange]);

  return {
    runScheduler: useCallback(() => {
      const nextStatus = determineCurrentStatus(settings);
      if (nextStatus) {
        stableOnStatusChange(nextStatus);
      }
    }, [settings, stableOnStatusChange])
  };
};

export default usePosAutoScheduler; 
