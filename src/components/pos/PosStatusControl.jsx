import React from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import styles from './PosStatusControl.module.css';

const PosStatusControl = ({ currentStatus, onStatusChange, disabled }) => {
  const handleStatusChange = (newStatus) => {
    if (disabled || newStatus === currentStatus) return;
    onStatusChange(newStatus);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.openButton}
        onClick={() => handleStatusChange(POS_STATUS.OPEN)}
        disabled={disabled || currentStatus === POS_STATUS.OPEN}
      >
        {POS_STATUS_LABEL[POS_STATUS.OPEN]}
      </button>
      
      <button
        className={styles.breakButton}
        onClick={() => handleStatusChange(POS_STATUS.BREAK)}
        disabled={disabled || currentStatus === POS_STATUS.BREAK}
      >
        {POS_STATUS_LABEL[POS_STATUS.BREAK]}
      </button>
      
      <button
        className={styles.preparingButton}
        onClick={() => handleStatusChange(POS_STATUS.PREPARING)}
        disabled={disabled || currentStatus === POS_STATUS.PREPARING}
      >
        {POS_STATUS_LABEL[POS_STATUS.PREPARING]}
      </button>
      
      <button
        className={styles.closeButton}
        onClick={() => handleStatusChange(POS_STATUS.CLOSED)}
        disabled={disabled || currentStatus === POS_STATUS.CLOSED}
      >
        {POS_STATUS_LABEL[POS_STATUS.CLOSED]}
      </button>
    </div>
  );
};

PosStatusControl.propTypes = {
  currentStatus: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

PosStatusControl.defaultProps = {
  disabled: false,
};

export default PosStatusControl; 
