import {
  parseTimeString,
  isWithinOperatingHours,
  determineCurrentStatus,
  getNextStatusChangeDelay,
  isValidTimeFormat,
  validateAutoSettings,
  scheduleNextStatusChange,
  cancelScheduledChange,
} from '../posAutoScheduler';
import { POS_STATUS } from '../../constants/posStatus';
import { renderHook } from '@testing-library/react';
import usePosAutoScheduler from '../../hooks/usePosAutoScheduler';
import * as posAPI from '../../services/posAPI';
import { vi, describe, test, expect, beforeEach, afterEach, it } from 'vitest';

vi.mock('../../services/posAPI');

const mockPosId = 'test-pos-id';

// 테스트용 mock 데이터
const mockDate = new Date(2024, 0, 1, 10, 0, 0);
const mockScheduleTime = '14:00';
const mockSettings = {
  autoOpen: true,
  autoClose: true,
  autoOpenTime: '09:00',
  autoCloseTime: '22:00'
};

describe('posAutoScheduler utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 테스트용 기준 시간 설정 (2024-01-01 10:00:00 UTC)
    vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));
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
    beforeEach(() => {
      // 테스트용 시간 고정 (10:00 UTC)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-20T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('영업 시간 내인 경우', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '18:00'
      };
      expect(isWithinOperatingHours(settings)).toBe(true);
    });

    it('영업 시간 외인 경우', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '14:00',
        autoClose: true,
        autoCloseTime: '22:00'
      };
      expect(isWithinOperatingHours(settings)).toBe(false);
    });

    it('자정을 넘어가는 영업 시간 처리', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '22:00',
        autoClose: true,
        autoCloseTime: '02:00'
      };
      expect(isWithinOperatingHours(settings)).toBe(false);
    });

    it('자동화 설정이 비활성화된 경우', () => {
      const settings = {
        autoOpen: false,
        autoOpenTime: '09:00',
        autoClose: false,
        autoCloseTime: '18:00'
      };
      expect(isWithinOperatingHours(settings)).toBe(false);
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
      vi.setSystemTime(new Date('2024-01-01T22:00:00Z')); // 22:00 UTC로 시간 변경
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
      posId: mockPosId,
      autoOpen: true,
      autoClose: true,
      autoOpenTime: '09:00',
      autoCloseTime: '22:00',
    };
    const onStatusChange = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(posAPI.updatePosStatusWithNotification).mockRejectedValue(new Error('API Error'));

    renderHook(() => usePosAutoScheduler(settings, onStatusChange));

    await vi.runAllTimersAsync();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to auto-update POS status:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
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

describe('POS Auto Scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('schedules next status change correctly', async () => {
    vi.mocked(posAPI.updatePosStatusWithNotification).mockResolvedValue(undefined);
    const settings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00',
    };

    const mockDate = new Date('2024-03-20T00:00:00Z');
    vi.setSystemTime(mockDate);

    const expectedDelay = 9 * 60 * 60 * 1000;
    scheduleNextStatusChange(mockPosId, settings);

    await vi.advanceTimersByTimeAsync(expectedDelay);

    expect(posAPI.updatePosStatusWithNotification).toHaveBeenCalledWith(
      mockPosId,
      expect.objectContaining({ status: POS_STATUS.OPEN })
    );
  });

  it('determines operating hours correctly', () => {
    const settings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    // 영업 시간 내
    vi.setSystemTime(new Date('2024-03-20T10:00:00Z'));
    expect(isWithinOperatingHours(settings)).toBe(true);

    // 영업 시간 외
    vi.setSystemTime(new Date('2024-03-20T23:00:00Z'));
    expect(isWithinOperatingHours(settings)).toBe(false);
  });

  it('determines current status correctly', () => {
    const settings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    // 영업 시간 내
    vi.setSystemTime(new Date('2024-03-20T10:00:00Z'));
    expect(determineCurrentStatus(settings)).toBe(POS_STATUS.OPEN);

    // 영업 시간 외
    vi.setSystemTime(new Date('2024-03-20T23:00:00Z'));
    expect(determineCurrentStatus(settings)).toBe(POS_STATUS.CLOSED);
  });

  it('executes scheduled change at correct time', async () => {
    const settings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    const mockDate = new Date('2024-03-20T00:00:00Z'); // UTC 기준 00:00
    vi.setSystemTime(mockDate);

    // 현재 시간이 00:00이므로 09:00까지 9시간(32400000ms) 기다려야 함
    const expectedDelay = 9 * 60 * 60 * 1000;
    const actualDelay = getNextStatusChangeDelay(settings);
    expect(actualDelay).toBe(expectedDelay);

    scheduleNextStatusChange(mockPosId, settings);

    // 예약된 시간으로 이동하고 Promise가 처리될 때까지 기다림
    await vi.advanceTimersByTimeAsync(expectedDelay);
    await vi.runAllTicks();

    expect(posAPI.updatePosStatusWithNotification).toHaveBeenCalledWith(
      mockPosId,
      expect.objectContaining({
        status: POS_STATUS.OPEN,
        reason: '자동 영업 시작',
        category: 'AUTO'
      })
    );
  });

  it('cancels scheduled change correctly', async () => {
    const settings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00',
    };

    const mockDate = new Date('2024-03-20T00:00:00Z'); // UTC 기준 00:00
    vi.setSystemTime(mockDate);

    const timeoutId = scheduleNextStatusChange(mockPosId, settings);
    cancelScheduledChange(timeoutId);

    // 예약된 시간으로 이동
    await vi.advanceTimersByTimeAsync(3600000); // 1시간 후
    await vi.runAllTicks();

    expect(posAPI.updatePosStatusWithNotification).not.toHaveBeenCalled();
  });

  describe('isValidTimeFormat', () => {
    test.each([
      ['10:00', true],
      ['23:59', true],
      ['00:00', true],
      ['24:00', false],
      ['10:60', false],
      ['1000', false],
      ['10:0', false],
      ['', false],
      [null, false],
      ['abc', false],
    ])('validates time format %s correctly', (input, expected) => {
      expect(isValidTimeFormat(input)).toBe(expected);
    });
  });

  describe('validateAutoSettings', () => {
    test('validates correct settings', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '22:00'
      };
      const result = validateAutoSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects invalid open time', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '25:00',
        autoClose: false,
        autoCloseTime: '22:00'
      };
      const result = validateAutoSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('자동 오픈 시간이 올바르지 않습니다.');
    });

    test('detects invalid close time', () => {
      const settings = {
        autoOpen: false,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '24:00'
      };
      const result = validateAutoSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('자동 마감 시간이 올바르지 않습니다.');
    });

    test('detects same open and close time', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '09:00'
      };
      const result = validateAutoSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('자동 오픈 시간과 마감 시간이 같을 수 없습니다.');
    });
  });

  describe('isWithinOperatingHours', () => {
    test('handles normal operating hours', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '22:00'
      };

      // 영업 시간 내
      vi.setSystemTime(new Date('2024-03-20T14:00:00Z'));
      expect(isWithinOperatingHours(settings)).toBe(true);

      // 영업 시간 외
      vi.setSystemTime(new Date('2024-03-20T23:00:00Z'));
      expect(isWithinOperatingHours(settings)).toBe(false);
    });

    test('handles overnight operating hours', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '22:00',
        autoClose: true,
        autoCloseTime: '02:00'
      };

      // 영업 시간 내 (자정 이전)
      vi.setSystemTime(new Date('2024-03-20T23:00:00Z'));
      expect(isWithinOperatingHours(settings)).toBe(true);

      // 영업 시간 내 (자정 이후)
      vi.setSystemTime(new Date('2024-03-21T01:00:00Z'));
      expect(isWithinOperatingHours(settings)).toBe(true);

      // 영업 시간 외
      vi.setSystemTime(new Date('2024-03-20T21:00:00Z'));
      expect(isWithinOperatingHours(settings)).toBe(false);
    });
  });

  describe('determineCurrentStatus', () => {
    test('returns null when auto settings are disabled', () => {
      const settings = {
        autoOpen: false,
        autoOpenTime: '09:00',
        autoClose: false,
        autoCloseTime: '22:00'
      };

      expect(determineCurrentStatus(settings)).toBe(null);
    });

    test('returns correct status during operating hours', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '09:00',
        autoClose: true,
        autoCloseTime: '22:00'
      };

      vi.setSystemTime(new Date('2024-03-20T14:00:00Z'));
      expect(determineCurrentStatus(settings)).toBe(POS_STATUS.OPEN);

      vi.setSystemTime(new Date('2024-03-20T23:00:00Z'));
      expect(determineCurrentStatus(settings)).toBe(POS_STATUS.CLOSED);
    });

    test('returns null for invalid settings', () => {
      const settings = {
        autoOpen: true,
        autoOpenTime: '25:00', // 잘못된 시간 형식
        autoClose: true,
        autoCloseTime: '22:00'
      };

      expect(determineCurrentStatus(settings)).toBe(null);
    });
  });
}); 
