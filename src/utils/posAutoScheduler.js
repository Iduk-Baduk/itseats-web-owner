import { POS_STATUS } from '../constants/posStatus';

// 시간 문자열을 Date 객체로 변환
export const parseTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
};

// 현재 시간이 설정된 시간 범위 내에 있는지 확인
export const isWithinOperatingHours = (openTime, closeTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHours, openMinutes] = openTime.split(':').map(Number);
  const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
  
  const openTimeMinutes = openHours * 60 + openMinutes;
  const closeTimeMinutes = closeHours * 60 + closeMinutes;
  
  // 영업 시간이 자정을 넘어가는 경우 (예: 22:00 ~ 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTime >= openTimeMinutes || currentTime <= closeTimeMinutes;
  }
  
  return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
};

// 다음 상태 변경까지 남은 시간(밀리초) 계산
export const getNextStatusChangeDelay = (settings) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  if (settings.autoOpen && settings.autoClose) {
    const [openHours, openMinutes] = settings.autoOpenTime.split(':').map(Number);
    const [closeHours, closeMinutes] = settings.autoCloseTime.split(':').map(Number);
    
    const openTimeMinutes = openHours * 60 + openMinutes;
    const closeTimeMinutes = closeHours * 60 + closeMinutes;
    
    // 다음 상태 변경 시간 계산
    let nextChangeMinutes;
    if (currentTime < openTimeMinutes) {
      nextChangeMinutes = openTimeMinutes;
    } else if (currentTime < closeTimeMinutes) {
      nextChangeMinutes = closeTimeMinutes;
    } else {
      // 다음 날 오픈 시간까지 대기
      nextChangeMinutes = openTimeMinutes + 24 * 60;
    }
    
    return (nextChangeMinutes - currentTime) * 60 * 1000;
  }
  
  return null;
};

// 현재 시간에 따른 적절한 POS 상태 결정
export const determineCurrentStatus = (settings) => {
  if (!settings.autoOpen || !settings.autoClose) {
    return null;
  }

  return isWithinOperatingHours(settings.autoOpenTime, settings.autoCloseTime)
    ? POS_STATUS.OPEN
    : POS_STATUS.CLOSED;
}; 
