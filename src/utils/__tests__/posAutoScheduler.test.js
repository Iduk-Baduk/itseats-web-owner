import { parseTimeString, isWithinOperatingHours, determineCurrentStatus, getNextStatusChangeDelay } from '../posAutoScheduler';
import { POS_STATUS } from '../../constants/posStatus';
import { renderHook } from '@testing-library/react';
import usePosAutoScheduler from '../../hooks/usePosAutoScheduler';
import * as POS_API from '../../services/posAPI';
import { vi } from 'vitest';

vi.mock('../../services/posAPI', () => ({
  default: {
    updatePosStatus: vi.fn()
  }
}));

describe('posAutoScheduler utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 테스트용 기준 시간 설정 (2024-01-01 10:00:00)
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parseTimeString', () => {
    it('시간 문자열을 Date 객체로 변환', () => {
      const result = parseTimeString('14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('자정 시간 처리', () => {
      const result = parseTimeString('00:00');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('isWithinOperatingHours', () => {
    it('영업 시간 내인 경우', () => {
      // mockDate는 10:00
      expect(isWithinOperatingHours('09:00', '18:00')).toBe(true);
    });

    it('영업 시간 외인 경우', () => {
      // mockDate는 10:00
      expect(isWithinOperatingHours('14:00', '22:00')).toBe(false);
    });

    it('자정을 넘어가는 영업 시간 처리', () => {
      // mockDate는 10:00
      expect(isWithinOperatingHours('22:00', '02:00')).toBe(false);
    });
  });

  describe('determineCurrentStatus', () => {
    it('자동화가 비활성화된 경우 null 반환', () => {
      const settings = {
        autoOpen: false,
        autoClose: false,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      expect(determineCurrentStatus(settings)).toBe(null);
    });

    it('영업 시간 내인 경우 OPEN 상태 반환', () => {
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      expect(determineCurrentStatus(settings)).toBe(POS_STATUS.OPEN);
    });

    it('영업 시간 외인 경우 CLOSED 상태 반환', () => {
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '14:00',
        autoCloseTime: '22:00',
      };
      expect(determineCurrentStatus(settings)).toBe(POS_STATUS.CLOSED);
    });
  });

  describe('getNextStatusChangeDelay', () => {
    it('자동화가 비활성화된 경우 null 반환', () => {
      const settings = {
        autoOpen: false,
        autoClose: false,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      expect(getNextStatusChangeDelay(settings)).toBe(null);
    });

    it('다음 오픈 시간까지의 지연 시간 계산', () => {
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '14:00',
        autoCloseTime: '22:00',
      };
      const expectedDelay = 4 * 60 * 60 * 1000; // 4시간을 밀리초로 변환
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });

    it('다음 마감 시간까지의 지연 시간 계산', () => {
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      const expectedDelay = 8 * 60 * 60 * 1000; // 8시간을 밀리초로 변환
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });

    it('다음 날 오픈 시간까지의 지연 시간 계산', () => {
      vi.setSystemTime(new Date(2024, 0, 1, 22, 0, 0)); // 22:00로 시간 변경
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      const expectedDelay = 11 * 60 * 60 * 1000; // 11시간을 밀리초로 변환
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });
  });
});

describe('usePosAutoScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('자동화 설정이 비활성화된 경우 스케줄러가 시작되지 않아야 함', () => {
    const settings = {
      autoOpen: false,
      autoClose: false,
      autoOpenTime: '09:00',
      autoCloseTime: '22:00'
    };
    const onStatusChange = vi.fn();

    renderHook(() => usePosAutoScheduler(settings, onStatusChange));

    vi.runAllTimers();
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it('자동화 설정이 활성화된 경우 현재 상태를 즉시 업데이트해야 함', () => {
    const settings = {
      autoOpen: true,
      autoClose: true,
      autoOpenTime: '09:00',
      autoCloseTime: '22:00'
    };
    const onStatusChange = vi.fn();

    renderHook(() => usePosAutoScheduler(settings, onStatusChange));

    expect(onStatusChange).toHaveBeenCalledTimes(1);
  });

  it('상태 변경 시 API 호출이 실패하면 에러를 로깅해야 함', async () => {
    const settings = {
      autoOpen: true,
      autoClose: true,
      autoOpenTime: '09:00',
      autoCloseTime: '22:00'
    };
    const onStatusChange = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error');
    POS_API.default.updatePosStatus.mockRejectedValueOnce(new Error('API Error'));

    renderHook(() => usePosAutoScheduler(settings, onStatusChange));
    
    vi.runAllTimers();
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to auto-update POS status:',
      expect.any(Error)
    );
  });

  it('컴포넌트 언마운트 시 타이머가 정리되어야 함', () => {
    const settings = {
      autoOpen: true,
      autoClose: true,
      autoOpenTime: '09:00',
      autoCloseTime: '22:00'
    };
    const onStatusChange = vi.fn();

    const { unmount } = renderHook(() => usePosAutoScheduler(settings, onStatusChange));
    
    unmount();
    vi.runAllTimers();
    
    expect(onStatusChange).toHaveBeenCalledTimes(1); // 초기 상태 업데이트만 호출됨
  });
}); 
