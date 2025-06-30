import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, POS_STATUS_LABEL } from '../../constants/posStatus';
import PosStatusChangeDialog from './PosStatusChangeDialog';
import styles from './PosStatusControl.module.css';
import posAPI from '../../services/posAPI';
import { toast } from 'react-hot-toast';

const PosStatusControl = ({ currentStatus, onStatusChange, disabled }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);

  const handleStatusClick = (newStatus) => {
    if (newStatus === currentStatus) return;
    
    // 다이얼로그 열기
    setTargetStatus(newStatus);
    setIsDialogOpen(true);
  };

  const handleConfirmStatusChange = async (metadata) => {
    try {
      // 현재 사용자 정보 (실제 앱에서는 인증 시스템에서 가져옴)
      const currentUser = {
        userId: 'admin001',
        userName: '관리자'
      };

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
    <>
      <div className={styles.container}>
        <h3 className={styles.title}>POS 상태 관리</h3>
        <div className={styles.buttonGroup}>
          {Object.values(POS_STATUS).map(status => (
            <button
              key={status}
              className={`${styles.button} ${currentStatus === status ? styles.active : ''}`}
              onClick={() => handleStatusClick(status)}
              disabled={disabled || currentStatus === status}
              aria-label={POS_STATUS_LABEL[status]}
            >
              {POS_STATUS_LABEL[status]}
            </button>
          ))}
        </div>
      </div>

      {/* 상태 변경 확인 다이얼로그 */}
      <PosStatusChangeDialog
        isOpen={isDialogOpen}
        currentStatus={currentStatus}
        targetStatus={targetStatus || currentStatus}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />
    </>
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
