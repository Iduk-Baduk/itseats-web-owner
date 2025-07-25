import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import PosStatusChangeDialog from './PosStatusChangeDialog';
import styles from './PosStatusControl.module.css';
import posAPI from '../../services/posAPI';
import { useAuth } from '../../contexts/AuthContext';

const PosStatusControl = ({ posId, currentStatus, onStatusChange }) => {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleStatusButtonClick = (status) => {
    if (status !== currentStatus) {
      setTargetStatus(status);
      setIsDialogOpen(true);
    }
  };

  const getButtonClassName = (status) => {
    switch (status) {
      case POS_STATUS.OPEN:
        return styles.openButton;
      case POS_STATUS.CLOSED:
        return styles.closeButton;
      case POS_STATUS.BREAK:
        return styles.breakButton;
      case POS_STATUS.PREPARING:
        return styles.preparingButton;
      default:
        return '';
    }
  };

  const handleStatusChange = async (formData) => {
    try {
      if (!currentUser) {
        throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
      }

      const statusData = {
        status: targetStatus,
        reason: formData.reason,
        notes: formData.notes,
        userId: currentUser.userId,
        userName: currentUser.userName,
        category: 'MANUAL',
        requiresApproval: false,
        estimatedRevenueLoss: formData.estimatedRevenueLoss || 0,
        affectedOrderCount: formData.affectedOrderCount || 0
      };

      // posId가 없으면 기본값 사용
      const posIdToUse = posId || 'default';
      await posAPI.updatePosStatusWithNotification(posIdToUse, statusData);
      onStatusChange(targetStatus);
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Status change error:', err);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTargetStatus(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
      {Object.entries(POS_STATUS).map(([key, value]) => (
        <button
          key={key}
          className={getButtonClassName(value)}
          onClick={() => handleStatusButtonClick(value)}
          disabled={currentStatus === value}
        >
          {POS_STATUS_LABEL[value]}
        </button>
      ))}
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
  posId: PropTypes.string,
  currentStatus: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default PosStatusControl; 
