import { POS_STATUS } from '../constants/posStatus';

/**
 * @typedef {Object} AutoSettings
 * @property {boolean} autoOpen - 자동 오픈 활성화 여부
 * @property {string} autoOpenTime - 자동 오픈 시간 (HH:mm 형식)
 * @property {boolean} autoClose - 자동 마감 활성화 여부
 * @property {string} autoCloseTime - 자동 마감 시간 (HH:mm 형식)
 */

/**
 * 시간 문자열이 유효한 형식(HH:mm)인지 검사
 * @param {string} timeStr - 검사할 시간 문자열
 * @returns {boolean} 유효성 여부
 */
export const isValidTimeFormat = (timeStr) => {
  if (!timeStr) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

/**
 * 자동화 설정이 유효한지 검사
 * @param {AutoSettings} settings - 검사할 설정
 * @returns {{isValid: boolean, errors: string[]}} 유효성 검사 결과
 */
export const validateAutoSettings = (settings) => {
  const errors = [];

  if (settings.autoOpen && !isValidTimeFormat(settings.autoOpenTime)) {
    errors.push('자동 오픈 시간이 올바르지 않습니다.');
  }

  if (settings.autoClose && !isValidTimeFormat(settings.autoCloseTime)) {
    errors.push('자동 마감 시간이 올바르지 않습니다.');
  }

  if (settings.autoOpen && settings.autoClose) {
    const openTime = convertTimeStringToMinutes(settings.autoOpenTime);
    const closeTime = convertTimeStringToMinutes(settings.autoCloseTime);
    
    if (openTime === closeTime) {
      errors.push('자동 오픈 시간과 마감 시간이 같을 수 없습니다.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 시간 문자열을 분 단위로 변환
 * @param {string} timeStr - 변환할 시간 문자열 (HH:mm 형식)
 * @returns {number} 분 단위 시간
 */
export const convertTimeStringToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 현재 시간이 영업 시간 내인지 확인
 * @param {AutoSettings} settings - 자동화 설정
 * @returns {boolean} 영업 시간 내 여부
 */
export const isWithinOperatingHours = (settings) => {
  if (!settings.autoOpen || !settings.autoClose) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = convertTimeStringToMinutes(settings.autoOpenTime);
  const closeMinutes = convertTimeStringToMinutes(settings.autoCloseTime);

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    // 자정을 넘어가는 경우 (예: 22:00 ~ 02:00)
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
};

/**
 * 현재 시간과 설정에 따른 POS 상태 결정
 * @param {AutoSettings} settings - 자동화 설정
 * @returns {POS_STATUS | null} 결정된 POS 상태 또는 null
 */
export const determineCurrentStatus = (settings) => {
  if (!settings.autoOpen && !settings.autoClose) return null;

  const validation = validateAutoSettings(settings);
  if (!validation.isValid) {
    console.error('자동화 설정 오류:', validation.errors);
    return null;
  }

  const isWithinHours = isWithinOperatingHours(settings);
  return isWithinHours ? POS_STATUS.OPEN : POS_STATUS.CLOSED;
};

// 시간 문자열을 Date 객체로 변환
export const parseTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const result = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return result;
};

// 다음 상태 변경까지 남은 시간(밀리초) 계산
export const getNextStatusChangeDelay = (settings) => {
  if (!settings.autoOpen && !settings.autoClose) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHours, openMinutes] = (settings.autoOpenTime || '00:00').split(':').map(Number);
  const [closeHours, closeMinutes] = (settings.autoCloseTime || '00:00').split(':').map(Number);
  
  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
  // 현재 영업 시간 상태 확인 (자동 오픈과 마감이 모두 활성화된 경우에만)
  const isOpen = settings.autoOpen && settings.autoClose ? 
    isWithinOperatingHours(settings) :
    null;

  // 자동 오픈만 활성화된 경우
  if (settings.autoOpen && !settings.autoClose) {
    if (currentTime < openTimeMinutes) {
      return (openTimeMinutes - currentTime) * 60 * 1000;
    }
    return ((24 * 60 - currentTime) + openTimeMinutes) * 60 * 1000;
  }

  // 자동 마감만 활성화된 경우
  if (!settings.autoOpen && settings.autoClose) {
    if (currentTime < closeTimeMinutes) {
      return (closeTimeMinutes - currentTime) * 60 * 1000;
    }
    return ((24 * 60 - currentTime) + closeTimeMinutes) * 60 * 1000;
  }

  // 둘 다 활성화된 경우 기존 로직 사용
  if (!isOpen) {
    if (currentTime < openTimeMinutes) {
      return (openTimeMinutes - currentTime) * 60 * 1000;
    } else {
      return ((24 * 60 - currentTime) + openTimeMinutes) * 60 * 1000;
    }
  } else {
    if (closeTimeMinutes < openTimeMinutes) {
      if (currentTime >= openTimeMinutes) {
        return ((24 * 60 - currentTime) + closeTimeMinutes) * 60 * 1000;
      } else {
        return (closeTimeMinutes - currentTime) * 60 * 1000;
      }
    } else {
      return (closeTimeMinutes - currentTime) * 60 * 1000;
    }
  }
}; 
