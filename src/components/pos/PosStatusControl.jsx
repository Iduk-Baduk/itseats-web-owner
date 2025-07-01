import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import PosStatusChangeDialog from './PosStatusChangeDialog';
import styles from './PosStatusControl.module.css';
import posAPI from '../../services/posAPI';
import { useAuth } from '../../contexts/AuthContext';

const PosStatusControl = ({ posId, currentStatus, onStatusChange }) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleStatusButtonClick = (status) => {
    if (status !== currentStatus) {
      setTargetStatus(status);
      setIsDialogOpen(true);
    }
  };

  const handleStatusChange = async (formData) => {
    try {
      const statusData = {
        status: targetStatus,
        reason: formData.reason,
        notes: formData.notes,
        userId: user.id,
        userName: user.name,
        category: 'MANUAL',
        requiresApproval: false,
        estimatedRevenueLoss: formData.estimatedRevenueLoss || 0,
        affectedOrderCount: formData.affectedOrderCount || 0
      };

      await posAPI.updatePosStatusWithNotification(posId, statusData);
      onStatusChange(targetStatus);
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTargetStatus(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusButtons}>
        {Object.entries(POS_STATUS).map(([key, value]) => (
          <button
            key={key}
            className={`${styles.statusButton} ${currentStatus === value ? styles.active : ''}`}
            onClick={() => handleStatusButtonClick(value)}
            disabled={currentStatus === value}
          >
            {POS_STATUS_LABEL[value]}
          </button>
        ))}
      </div>
      <PosStatusChangeDialog
        isOpen={isDialogOpen}
        currentStatus={currentStatus}
        targetStatus={targetStatus}
        onConfirm={handleStatusChange}
        onClose={handleDialogClose}
        error={error}
      />
    </div>
  );
};

PosStatusControl.propTypes = {
  posId: PropTypes.string.isRequired,
  currentStatus: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default PosStatusControl; 
