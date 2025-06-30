import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import PosStatusChangeDialog from './PosStatusChangeDialog';
import styles from './PosStatusControl.module.css';
import posAPI from '../../services/posAPI';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PosStatusControl = ({ currentStatus, onStatusChange, disabled }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const { currentUser } = useAuth();

  const handleStatusClick = (newStatus) => {
    if (newStatus === currentStatus) return;
    
    // 다이얼로그 열기
    setTargetStatus(newStatus);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = async (metadata) => {
    try {
      if (!currentUser) {
        toast.error('인증이 필요합니다.');
        return;
      }

      // 메타데이터에 사용자 정보 추가
      const fullMetadata = {
        ...metadata,
        userId: currentUser.userId,
        userName: currentUser.userName
      };

      await posAPI.updatePosStatus(targetStatus, fullMetadata);
      onStatusChange(targetStatus);
      
      // 성공 알림
      toast.success(`POS 상태가 ${POS_STATUS_LABEL[targetStatus]}로 변경되었습니다.`, {
        duration: 3000,
        position: 'top-right'
      });
      
      // 다이얼로그 닫기
      setIsDialogOpen(false);
      setTargetStatus(null);
    } catch (error) {
      console.error('Failed to update POS status:', error);
      toast.error('POS 상태 변경에 실패했습니다.', {
        duration: 4000,
        position: 'top-right'
      });
    }
  };

  const handleCancelStatusChange = () => {
    setIsDialogOpen(false);
    setTargetStatus(null);
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
            onClick={() => handleStatusClick(status)}
            disabled={disabled || status === currentStatus}
          >
            {POS_STATUS_LABEL[status]}
          </button>
        ))}
      </div>

      {isDialogOpen && (
        <PosStatusChangeDialog
          isOpen={isDialogOpen}
          currentStatus={currentStatus}
          targetStatus={targetStatus}
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
        />
      )}
    </div>
  );
};

PosStatusControl.propTypes = {
  currentStatus: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default PosStatusControl; 
