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

// 상태 변경 카테고리
export const STATUS_CHANGE_CATEGORY = {
  MANUAL: 'MANUAL',       // 수동 변경
  AUTO: 'AUTO',           // 자동 변경
  SCHEDULED: 'SCHEDULED', // 예약 변경
  EMERGENCY: 'EMERGENCY'  // 긴급 변경
};

// 카테고리별 표시 텍스트
export const STATUS_CHANGE_CATEGORY_LABEL = {
  [STATUS_CHANGE_CATEGORY.MANUAL]: '수동 변경',
  [STATUS_CHANGE_CATEGORY.AUTO]: '자동 변경',
  [STATUS_CHANGE_CATEGORY.SCHEDULED]: '예약 변경',
  [STATUS_CHANGE_CATEGORY.EMERGENCY]: '긴급 변경'
};

// 상태 변경 사유 템플릿
export const STATUS_CHANGE_REASONS = {
  [POS_STATUS.OPEN]: [
    '정상 영업 시작',
    '자동 영업 시작',
    '임시 영업 재개',
    '점검 완료 후 영업 재개'
  ],
  [POS_STATUS.CLOSED]: [
    '정기 휴무',
    '임시 휴무',
    '시스템 점검',
    '재료 부족',
    '직원 부족',
    '긴급 상황',
    '자동 영업 종료'
  ],
  [POS_STATUS.BREAK]: [
    '점심시간 휴게',
    '저녁시간 휴게',
    '직원 교체 시간',
    '임시 휴게',
    '청소 시간'
  ],
  [POS_STATUS.PREPARING]: [
    '개점 준비',
    '메뉴 준비',
    '시스템 점검',
    '직원 교육'
  ]
};

// 승인이 필요한 상태 변경
export const APPROVAL_REQUIRED_STATUSES = [
  POS_STATUS.CLOSED,
  POS_STATUS.BREAK
];

// 알림 타입
export const NOTIFICATION_TYPE = {
  STATUS_CHANGE: 'STATUS_CHANGE',
  APPROVAL_REQUEST: 'APPROVAL_REQUEST',
  SYSTEM_ALERT: 'SYSTEM_ALERT'
};

// 알림 심각도
export const NOTIFICATION_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};

// 심각도별 스타일
export const NOTIFICATION_SEVERITY_STYLE = {
  [NOTIFICATION_SEVERITY.INFO]: {
    color: '#1976D2',
    backgroundColor: '#E3F2FD'
  },
  [NOTIFICATION_SEVERITY.WARNING]: {
    color: '#F57C00',
    backgroundColor: '#FFF3E0'
  },
  [NOTIFICATION_SEVERITY.ERROR]: {
    color: '#D32F2F',
    backgroundColor: '#FFEBEE'
  },
  [NOTIFICATION_SEVERITY.SUCCESS]: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9'
  }
}; 
