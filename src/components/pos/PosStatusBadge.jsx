import React from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL, POS_STATUS_STYLE } from '../../constants/posStatus';
import styles from './PosStatusBadge.module.css';

const PosStatusBadge = ({ status }) => {
  const style = POS_STATUS_STYLE[status];
  
  return (
    <div 
      className={styles.badge}
      style={style}
    >
      {POS_STATUS_LABEL[status]}
    </div>
  );
};

PosStatusBadge.propTypes = {
  status: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
};

export default PosStatusBadge; 
