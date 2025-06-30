// POS 상태 enum
export const POS_STATUS = {
  OPEN: 'OPEN',           // 영업중
  CLOSED: 'CLOSED',       // 영업 종료
  BREAK: 'BREAK',         // 브레이크타임
  PREPARING: 'PREPARING'  // 준비중
};

// 상태별 표시 텍스트
export const POS_STATUS_LABEL = {
  [POS_STATUS.OPEN]: '영업중',
  [POS_STATUS.CLOSED]: '영업 종료',
  [POS_STATUS.BREAK]: '브레이크타임',
  [POS_STATUS.PREPARING]: '준비중'
};

// 상태별 스타일 설정
export const POS_STATUS_STYLE = {
  [POS_STATUS.OPEN]: {
    color: '#2E7D32',      // 초록색
    backgroundColor: '#E8F5E9'
  },
  [POS_STATUS.CLOSED]: {
    color: '#D32F2F',      // 빨간색
    backgroundColor: '#FFEBEE'
  },
  [POS_STATUS.BREAK]: {
    color: '#F57C00',      // 주황색
    backgroundColor: '#FFF3E0'
  },
  [POS_STATUS.PREPARING]: {
    color: '#1976D2',      // 파란색
    backgroundColor: '#E3F2FD'
  }
}; 
