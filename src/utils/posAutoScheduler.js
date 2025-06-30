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

// 다음 상태 변경까지 남은 시간(밀리초) 계산
export const getNextStatusChangeDelay = (settings) => {
  if (!settings.autoOpen || !settings.autoClose || !settings.autoOpenTime || !settings.autoCloseTime) {
    return null;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHours, openMinutes] = settings.autoOpenTime.split(':').map(Number);
  const [closeHours, closeMinutes] = settings.autoCloseTime.split(':').map(Number);
  
  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
  // 현재 영업 시간 상태 확인
  const isOpen = isWithinOperatingHours(settings.autoOpenTime, settings.autoCloseTime);
  
  if (!isOpen) {
    // 영업 시간 외: 다음 오픈 시간까지의 지연 시간 계산
    if (currentTime < openTimeMinutes) {
      // 오늘 오픈 시간까지 대기
      return (openTimeMinutes - currentTime) * 60 * 1000;
    } else {
      // 다음 날 오픈 시간까지 대기
      return ((24 * 60 - currentTime) + openTimeMinutes) * 60 * 1000;
    }
  } else {
    // 영업 중: 마감 시간까지의 지연 시간 계산
    return (closeTimeMinutes - currentTime) * 60 * 1000;
  }
};

// 현재 시간에 따른 적절한 POS 상태 결정
export const determineCurrentStatus = (settings) => {
  if (!settings.autoOpen || !settings.autoClose || !settings.autoOpenTime || !settings.autoCloseTime) {
    return null;
  }

  return isWithinOperatingHours(settings.autoOpenTime, settings.autoCloseTime)
    ? POS_STATUS.OPEN
    : POS_STATUS.CLOSED;
}; 
