import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Date 객체나 타임스탬프 문자열을 ISO 8601 형식으로 변환
 */
export const toISOString = (date) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

/**
 * 상대적 시간 표시 (예: "3분 전")
 */
export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
};

/**
 * 날짜를 지정된 형식으로 포맷팅
 */
export const formatDate = (date, formatString = 'yyyy-MM-dd HH:mm:ss') => {
  return format(new Date(date), formatString, { locale: ko });
};

/**
 * 타임스탬프가 유효한지 검증
 */
export const isValidTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}; 
