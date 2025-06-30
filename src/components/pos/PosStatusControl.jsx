import React from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import styles from './PosStatusControl.module.css';
import posAPI from '../../services/posAPI';
import { toast } from 'react-hot-toast';

const PosStatusControl = ({ currentStatus, onStatusChange, disabled }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await posAPI.updatePosStatus(newStatus);
      onStatusChange(newStatus);
      toast.success(`POS 상태가 ${POS_STATUS_LABEL[newStatus]}로 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to update POS status:', error);
      toast.error('POS 상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>POS 상태 관리</h3>
      <div className={styles.buttonGroup}>
        {Object.values(POS_STATUS).map(status => (
          <button
            key={status}
            className={`${styles.button} ${currentStatus === status ? styles.active : ''}`}
            onClick={() => handleStatusChange(status)}
            disabled={disabled || currentStatus === status}
            aria-label={POS_STATUS_LABEL[status]}
          >
            {POS_STATUS_LABEL[status]}
          </button>
        ))}
      </div>
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
