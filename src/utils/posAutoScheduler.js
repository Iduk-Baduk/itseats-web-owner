import { POS_STATUS } from '../constants/posStatus';

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

// 현재 시간이 설정된 시간 범위 내에 있는지 확인
export const isWithinOperatingHours = (openTime, closeTime) => {
  if (!openTime || !closeTime) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHours, openMinutes] = openTime.split(':').map(Number);
  const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
  
  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
  // 영업 시간이 자정을 넘어가는 경우 (예: 22:00 ~ 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTime >= openTimeMinutes || currentTime < closeTimeMinutes;
  }
  
  return currentTime >= openTimeMinutes && currentTime < closeTimeMinutes;
};

// 설정의 유효성을 검사하는 함수
const isValidSettings = (settings) => {
  if (!settings) return false;
  
  // 자동 오픈 설정 검증
  const hasValidOpenSettings = !settings.autoOpen || (settings.autoOpen && settings.autoOpenTime);
  
  // 자동 마감 설정 검증
  const hasValidCloseSettings = !settings.autoClose || (settings.autoClose && settings.autoCloseTime);
  
  return hasValidOpenSettings && hasValidCloseSettings;
};

// 다음 상태 변경까지 남은 시간(밀리초) 계산
export const getNextStatusChangeDelay = (settings) => {
  if (!isValidSettings(settings)) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // 자동화가 모두 비활성화된 경우
  if (!settings.autoOpen && !settings.autoClose) {
    return null;
  }
  
  const [openHours, openMinutes] = (settings.autoOpenTime || '00:00').split(':').map(Number);
  const [closeHours, closeMinutes] = (settings.autoCloseTime || '00:00').split(':').map(Number);
  
  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
  // 현재 영업 시간 상태 확인 (자동 오픈과 마감이 모두 활성화된 경우에만)
  const isOpen = settings.autoOpen && settings.autoClose ? 
    isWithinOperatingHours(settings.autoOpenTime, settings.autoCloseTime) :
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

// 현재 시간에 따른 적절한 POS 상태 결정
export const determineCurrentStatus = (settings) => {
  if (!isValidSettings(settings)) {
    return null;
  }

  // 자동화가 모두 비활성화된 경우
  if (!settings.autoOpen && !settings.autoClose) {
    return null;
  }

  // 자동 오픈만 활성화된 경우
  if (settings.autoOpen && !settings.autoClose) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHours, openMinutes] = settings.autoOpenTime.split(':').map(Number);
    const openTimeMinutes = openHours * 60 + openMinutes;
    
    return currentTime >= openTimeMinutes ? POS_STATUS.OPEN : POS_STATUS.CLOSED;
  }

  // 자동 마감만 활성화된 경우
  if (!settings.autoOpen && settings.autoClose) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [closeHours, closeMinutes] = settings.autoCloseTime.split(':').map(Number);
    const closeTimeMinutes = closeHours * 60 + closeMinutes;
    
    return currentTime >= closeTimeMinutes ? POS_STATUS.CLOSED : null;
  }

  // 둘 다 활성화된 경우
  return isWithinOperatingHours(settings.autoOpenTime, settings.autoCloseTime)
    ? POS_STATUS.OPEN
    : POS_STATUS.CLOSED;
}; 
