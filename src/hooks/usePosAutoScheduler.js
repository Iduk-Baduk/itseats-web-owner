import { useEffect, useRef } from 'react';
import { determineCurrentStatus, getNextStatusChangeDelay } from '../utils/posAutoScheduler';
import POS_API from '../services/posAPI';

const usePosAutoScheduler = (settings, onStatusChange) => {
  const timeoutRef = useRef(null);

  const scheduleNextStatusChange = () => {
    // 이전 타이머 제거
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 다음 상태 변경까지의 지연 시간 계산
    const delay = getNextStatusChangeDelay(settings);
    if (!delay) return;

    // 다음 상태 변경 예약
    timeoutRef.current = setTimeout(async () => {
      const nextStatus = determineCurrentStatus(settings);
      if (nextStatus) {
        try {
          await POS_API.updatePosStatus(nextStatus);
          onStatusChange(nextStatus);
        } catch (error) {
          console.error('Failed to auto-update POS status:', error);
        }
      }
      // 다음 상태 변경 스케줄링
      scheduleNextStatusChange();
    }, delay);
  };

  // 설정이 변경되거나 컴포넌트가 마운트될 때 스케줄러 시작
  useEffect(() => {
    // 자동화가 활성화된 경우에만 스케줄러 시작
    if (settings.autoOpen && settings.autoClose) {
      // 현재 상태 확인 및 필요한 경우 업데이트
      const currentStatus = determineCurrentStatus(settings);
      if (currentStatus) {
        onStatusChange(currentStatus);
      }
      
      scheduleNextStatusChange();
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [settings, onStatusChange]);
};

export default usePosAutoScheduler; 
