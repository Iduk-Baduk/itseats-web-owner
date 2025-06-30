import React from 'react';
import PropTypes from 'prop-types';
import styles from './PosStatusBadge.module.css';
import { POS_STATUS, POS_STATUS_LABEL, POS_STATUS_STYLE } from '../../constants/posStatus';

const PosStatusBadge = ({ status }) => {
  const style = POS_STATUS_STYLE[status];
  const label = POS_STATUS_LABEL[status];
  
  // 유효하지 않은 status의 경우 null 반환
  if (!style || !label) {
    console.warn(`Invalid POS status: ${status}`);
    return null;
  }
  
  return (
    <div 
      className={styles.badge}
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
};

export default PosStatusBadge; 
