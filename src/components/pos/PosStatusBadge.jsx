import React from 'react';
import PropTypes from 'prop-types';
import styles from './PosStatusBadge.module.css';
import { POS_STATUS, POS_STATUS_LABEL, POS_STATUS_STYLE } from '../../constants/posStatus';

const PosStatusBadge = ({ status, className }) => {
  const style = POS_STATUS_STYLE[status] || {
    backgroundColor: '#e0e0e0',  // 기본 배경색
    color: '#666666'            // 기본 텍스트 색상
  };
  const label = POS_STATUS_LABEL[status] || '알 수 없음';
  
  return (
    <div 
      className={`${styles.badge} ${className || ''}`}
      style={style}
      role="status"
      aria-label={`매장 상태: ${label}`}
    >
      {label}
    </div>
  );
};

PosStatusBadge.propTypes = {
  status: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  className: PropTypes.string,
};

PosStatusBadge.defaultProps = {
  className: '',
};

export default PosStatusBadge; 
