// 주문 상태 enum
export const ORDER_STATUS = {
  WAITING: 'WAITING',               // 대기중
  ACCEPTED: 'ACCEPTED',            // 수락됨
  REJECTED: 'REJECTED',            // 거절됨
  COOKING: 'COOKING',            // 조리중
  COOKED: 'COOKED',                // 조리완료
  RIDER_READY: 'RIDER_READY',      // 배차완료
  DELIVERING: 'DELIVERING',          // 배달중
  DELIVERED: 'DELIVERED',            // 배달완료
  COMPLETED: 'COMPLETED',          // 주문완료
};

// 주문 상태 레이블
export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.WAITING]: '대기중',
  [ORDER_STATUS.ACCEPTED]: '수락됨',
  [ORDER_STATUS.REJECTED]: '거절됨',
  [ORDER_STATUS.COOKING]: '조리중',
  [ORDER_STATUS.COOKED]: '조리완료',
  [ORDER_STATUS.RIDER_READY]: '배차완료',
  [ORDER_STATUS.DELIVERING]: '배달중',
  [ORDER_STATUS.DELIVERED]: '배달완료',
  [ORDER_STATUS.COMPLETED]: '주문완료',
};

// 주문 상태별 색상
export const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.WAITING]: '#FFA500',   // 주황색
  [ORDER_STATUS.ACCEPTED]: '#4CAF50',  // 초록색
  [ORDER_STATUS.REJECTED]: '#F44336',  // 빨간색
  [ORDER_STATUS.COOKING]: '#FF9800',   // 연한 주황색
  [ORDER_STATUS.COOKED]: '#8BC34A',    // 연한 초록색
  [ORDER_STATUS.RIDER_READY]: '#2196F3',     // 파란색
  [ORDER_STATUS.DELIVERING]: '#FF5722',   // 진한 주황색
  [ORDER_STATUS.DELIVERED]: '#9E9E9E', // 회색
  [ORDER_STATUS.COMPLETED]: '#9E9E9E', // 회색
};

// 주문 필터 옵션
export const ORDER_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: ORDER_STATUS.WAITING, label: '대기중' },
  { value: ORDER_STATUS.ACCEPTED, label: '수락됨' },
  { value: ORDER_STATUS.COOKING, label: '조리중' },
  { value: ORDER_STATUS.COOKED, label: '조리완료' },
  { value: ORDER_STATUS.RIDER_READY, label: '배차완료' },
  { value: ORDER_STATUS.DELIVERING, label: '배달중' },
  { value: ORDER_STATUS.DELIVERED, label: '배달완료' },
  { value: ORDER_STATUS.COMPLETED, label: '주문완료' },
];
