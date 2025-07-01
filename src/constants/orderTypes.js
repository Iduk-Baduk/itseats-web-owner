// 주문 상태 enum
export const ORDER_STATUS = {
  PENDING: 'PENDING',     // 대기중
  ACCEPTED: 'ACCEPTED',   // 수락됨
  REJECTED: 'REJECTED',   // 거절됨
  READY: 'READY',        // 조리완료
  COMPLETED: 'COMPLETED', // 배달완료
};

// 주문 상태 레이블
export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: '대기중',
  [ORDER_STATUS.ACCEPTED]: '수락됨',
  [ORDER_STATUS.REJECTED]: '거절됨',
  [ORDER_STATUS.READY]: '조리완료',
  [ORDER_STATUS.COMPLETED]: '배달완료',
};

// 주문 상태별 색상
export const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.PENDING]: '#FFA500',   // 주황색
  [ORDER_STATUS.ACCEPTED]: '#4CAF50',  // 초록색
  [ORDER_STATUS.REJECTED]: '#F44336',  // 빨간색
  [ORDER_STATUS.READY]: '#2196F3',     // 파란색
  [ORDER_STATUS.COMPLETED]: '#9E9E9E', // 회색
};

// 주문 필터 옵션
export const ORDER_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: ORDER_STATUS.PENDING, label: '대기중' },
  { value: ORDER_STATUS.ACCEPTED, label: '수락됨' },
  { value: ORDER_STATUS.READY, label: '조리완료' },
  { value: ORDER_STATUS.COMPLETED, label: '배달완료' },
]; 
