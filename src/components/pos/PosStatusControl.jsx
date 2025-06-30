import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import PosStatusChangeDialog from './PosStatusChangeDialog';
import styles from './PosStatusControl.module.css';
import { updatePosStatusWithNotification, ConcurrencyError, TransactionError } from '../../services/posAPI';
import { handleError } from '../../utils/errorHandler';
import { useAuth } from '../../contexts/AuthContext';

const PosStatusControl = ({ posId, currentStatus, onStatusChange, disabled = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleStatusChange = useCallback(async (changeData) => {
    setIsSubmitting(true);

    try {
      if (!currentUser) {
        console.error('인증이 필요합니다.');
        return;
      }

      const fullMetadata = {
        ...changeData,
        userId: currentUser.userId,
        userName: currentUser.userName
      };

      const result = await updatePosStatusWithNotification(posId, {
        status: targetStatus,
        ...fullMetadata
      });

      onStatusChange(result);
      setIsDialogOpen(false);
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        handleError(error, {
          showToast: true,
          errorField: 'submit',
          message: '다른 사용자가 이미 상태를 변경했습니다. 새로고침 후 다시 시도해주세요.'
        });
        onStatusChange(null);
      } else if (error instanceof TransactionError) {
        handleError(error, {
          showToast: true,
          errorField: 'submit',
          message: '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      } else {
        handleError(error, {
          showToast: true,
          errorField: 'submit'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [posId, targetStatus, onStatusChange, currentUser]);

  const handleStatusButtonClick = (status) => {
    if (status === currentStatus) return;
    
    setTargetStatus(status);
    setIsDialogOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusButtons}>
        {Object.values(POS_STATUS).map((status) => (
          <button
            key={status}
            className={`${styles.statusButton} ${
              status === currentStatus ? styles.active : ''
            }`}
            onClick={() => handleStatusButtonClick(status)}
            disabled={disabled || isSubmitting || status === currentStatus}
          >
            {POS_STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      <PosStatusChangeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleStatusChange}
        currentStatus={currentStatus}
        newStatus={targetStatus}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

PosStatusControl.propTypes = {
  posId: PropTypes.string.isRequired,
  currentStatus: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default PosStatusControl; 
