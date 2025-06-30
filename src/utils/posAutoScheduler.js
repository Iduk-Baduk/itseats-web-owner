import { POS_STATUS } from '../constants/posStatus';

/**
 * @typedef {Object} AutoSettings
 * @property {boolean} autoOpen - 자동 오픈 활성화 여부
 * @property {string} autoOpenTime - 자동 오픈 시간 (HH:mm 형식)
 * @property {boolean} autoClose - 자동 마감 활성화 여부
 * @property {string} autoCloseTime - 자동 마감 시간 (HH:mm 형식)
 */

/**
 * 시간 문자열이 유효한 형식인지 검증
 * @param {string} time - 시간 문자열 (HH:mm 형식)
 * @returns {boolean} 유효성 여부
 */
export const isValidTimeFormat = (time) => {
  if (!time) return false;
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(time);
};

/**
 * 자동화 설정 유효성 검증
 * @param {Object} settings - 자동화 설정
 * @returns {Object} 검증 결과
 */
export const validateAutoSettings = (settings) => {
  const errors = [];

  if (settings.autoOpen && !isValidTimeFormat(settings.autoOpenTime)) {
    errors.push('자동 오픈 시간이 올바르지 않습니다.');
  }

  if (settings.autoClose && !isValidTimeFormat(settings.autoCloseTime)) {
    errors.push('자동 마감 시간이 올바르지 않습니다.');
  }

  if (settings.autoOpen && settings.autoClose && 
      settings.autoOpenTime === settings.autoCloseTime) {
    errors.push('자동 오픈 시간과 마감 시간이 같을 수 없습니다.');
  }

  if (errors.length > 0) {
    console.warn('자동화 설정 오류:', errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 시간 문자열을 분으로 변환
 * @param {string} time - 시간 문자열 (HH:mm 형식)
 * @returns {number} 분 단위 시간
 */
export const convertTimeStringToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 현재 시간이 영업 시간 내인지 확인
 * @param {Object} settings - 자동화 설정
 * @returns {boolean} 영업 시간 내 여부
 */
export const isWithinOperatingHours = (settings) => {
  if (!settings.autoOpen && !settings.autoClose) {
    return false;
  }

  const validation = validateAutoSettings(settings);
  if (!validation.isValid) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = convertTimeStringToMinutes(settings.autoOpenTime);
  const closeMinutes = convertTimeStringToMinutes(settings.autoCloseTime);

  // 자정을 넘어가는 영업 시간 처리
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

/**
 * 현재 상태 결정
 * @param {Object} settings - 자동화 설정
 * @returns {string|null} POS 상태
 */
export const determineCurrentStatus = (settings) => {
  if (!settings.autoOpen && !settings.autoClose) {
    return null;
  }

  const validation = validateAutoSettings(settings);
  if (!validation.isValid) {
    return null;
  }

  return isWithinOperatingHours(settings) ? POS_STATUS.OPEN : POS_STATUS.CLOSED;
};

/**
 * 다음 상태 변경까지의 지연 시간 계산
 * @param {Object} settings - 자동화 설정
 * @returns {number|null} 지연 시간 (밀리초)
 */
export const getNextStatusChangeDelay = (settings) => {
  if (!settings.autoOpen && !settings.autoClose) {
    return null;
  }

  const validation = validateAutoSettings(settings);
  if (!validation.isValid) {
    return null;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = convertTimeStringToMinutes(settings.autoOpenTime);
  const closeMinutes = convertTimeStringToMinutes(settings.autoCloseTime);

  let nextChangeMinutes;
  const isCurrentlyOpen = isWithinOperatingHours(settings);

  if (isCurrentlyOpen) {
    // 영업 중인 경우 다음 마감 시간까지의 지연
    nextChangeMinutes = closeMinutes;
    if (closeMinutes <= currentMinutes) {
      nextChangeMinutes += 24 * 60;
    }
  } else {
    // 영업 종료 중인 경우 다음 오픈 시간까지의 지연
    nextChangeMinutes = openMinutes;
    if (openMinutes <= currentMinutes) {
      nextChangeMinutes += 24 * 60;
    }
  }

  return (nextChangeMinutes - currentMinutes) * 60 * 1000;
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
