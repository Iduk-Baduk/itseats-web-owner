import { parseTimeString, isWithinOperatingHours, determineCurrentStatus, getNextStatusChangeDelay } from '../posAutoScheduler';
import { POS_STATUS } from '../../constants/posStatus';

describe('posAutoScheduler utilities', () => {
  // Mock Date 객체를 사용하기 위한 설정
  const mockDate = new Date('2024-03-21T10:00:00Z');
  const originalDate = global.Date;

  beforeEach(() => {
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return new originalDate(date);
        }
        return mockDate;
      }
    };
  });

  afterEach(() => {
    global.Date = originalDate;
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
      expect(determineCurrentStatus(settings)).toBeNull();
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
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00',
      };
      expect(getNextStatusChangeDelay(settings)).toBeNull();
    });

    it('다음 오픈 시간까지의 지연 시간 계산', () => {
      // mockDate는 10:00
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '14:00', // 4시간 후
        autoCloseTime: '22:00',
      };
      const expectedDelay = 4 * 60 * 60 * 1000; // 4시간을 밀리초로 변환
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });

    it('다음 마감 시간까지의 지연 시간 계산', () => {
      // mockDate는 10:00
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '18:00', // 8시간 후
      };
      const expectedDelay = 8 * 60 * 60 * 1000; // 8시간을 밀리초로 변환
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });

    it('다음 날 오픈 시간까지의 지연 시간 계산', () => {
      // mockDate는 10:00
      const settings = {
        autoOpen: true,
        autoClose: true,
        autoOpenTime: '09:00',
        autoCloseTime: '12:00', // 이미 지난 시간
      };
      const expectedDelay = 23 * 60 * 60 * 1000; // 다음 날 9시까지 23시간
      expect(getNextStatusChangeDelay(settings)).toBe(expectedDelay);
    });
  });
}); 
