import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  POS_STATUS,
  POS_STATUS_LABEL, 
  STATUS_CHANGE_REASONS, 
  STATUS_CHANGE_CATEGORY,
  APPROVAL_REQUIRED_STATUSES 
} from '../../constants/posStatus';
import styles from './PosStatusChangeDialog.module.css';
import { handleError } from '../../utils/errorHandler';
import Button from '../basic/Button';
import TextInput from '../basic/TextInput';

const PosStatusChangeDialog = ({ 
  isOpen, 
  currentStatus, 
  targetStatus, 
  onClose, 
  onConfirm,
  requiresApproval = false 
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    customReason: '',
    notes: '',
    estimatedRevenueLoss: '',
    affectedOrderCount: '',
    category: STATUS_CHANGE_CATEGORY.MANUAL
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 다이얼로그가 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: '',
        customReason: '',
        notes: '',
        estimatedRevenueLoss: '',
        affectedOrderCount: '',
        category: STATUS_CHANGE_CATEGORY.MANUAL
      });
      setErrors({});
    }
  }, [isOpen, targetStatus]);

  const availableReasons = STATUS_CHANGE_REASONS[targetStatus] || [];

  const validateForm = () => {
    const newErrors = {};

    // 사유 검증
    if (!formData.reason) {
      newErrors.reason = '변경 사유를 선택해주세요.';
    }

    // 커스텀 사유 검증
    if (formData.reason === 'custom' && !formData.customReason.trim()) {
      newErrors.customReason = '사유를 입력해주세요.';
    }

    // 영업 종료나 브레이크 시 추가 정보 필수
    if ([POS_STATUS.CLOSED, POS_STATUS.BREAK].includes(targetStatus)) {
      if (!formData.estimatedRevenueLoss) {
        newErrors.estimatedRevenueLoss = '예상 매출 손실을 입력해주세요.';
      }
      if (!formData.affectedOrderCount) {
        newErrors.affectedOrderCount = '영향받는 주문 수를 입력해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!validateForm()) {
        return;
      }

      const finalReason = formData.reason === 'custom' 
        ? formData.customReason 
        : formData.reason;

      const changeData = {
        reason: finalReason,
        notes: formData.notes,
        estimatedRevenueLoss: parseInt(formData.estimatedRevenueLoss, 10) || 0,
        affectedOrderCount: parseInt(formData.affectedOrderCount, 10) || 0,
        category: formData.category,
        requiresApproval: requiresApproval
      };

      await onConfirm(changeData);
      onClose();
    } catch (error) {
      handleError(error, {
        showToast: true,
        setError: (field, { message }) => setError(message)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div 
        className={styles.dialog}
        role="dialog"
        aria-labelledby="dialog-title"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h3 id="dialog-title" className={styles.title}>POS 상태 변경 확인</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.statusChange}>
            <span className={styles.statusText}>
              {POS_STATUS_LABEL[currentStatus]}
            </span>
            <span className={styles.arrow}>→</span>
            <span className={styles.statusText}>
              {POS_STATUS_LABEL[targetStatus]}
            </span>
          </div>

          {requiresApproval && (
            <div className={styles.approvalNotice}>
              ⚠️ 이 상태 변경은 관리자 승인이 필요합니다.
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 변경 사유 */}
            <div className={styles.field}>
              <label className={styles.label}>
                변경 사유 <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className={`${styles.select} ${errors.reason ? styles.error : ''}`}
              >
                <option value="">사유를 선택하세요</option>
                {availableReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
                <option value="custom">직접 입력</option>
              </select>
              {errors.reason && <span className={styles.errorText}>{errors.reason}</span>}
            </div>

            {/* 커스텀 사유 입력 */}
            {formData.reason === 'custom' && (
              <div className={styles.field}>
                <label className={styles.label}>
                  사유 입력 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.customReason}
                  onChange={(e) => handleInputChange('customReason', e.target.value)}
                  placeholder="변경 사유를 입력하세요"
                  className={`${styles.input} ${errors.customReason ? styles.error : ''}`}
                />
                {errors.customReason && <span className={styles.errorText}>{errors.customReason}</span>}
              </div>
            )}

            {/* 메모 */}
            <div className={styles.field}>
              <label className={styles.label}>메모</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="추가 설명이나 메모를 입력하세요"
                className={styles.textarea}
                rows={3}
              />
            </div>

            {/* 영업 종료/브레이크 시 추가 정보 */}
            {([POS_STATUS.CLOSED, POS_STATUS.BREAK].includes(targetStatus)) && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>
                    예상 매출 손실 (원) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedRevenueLoss}
                    onChange={(e) => handleInputChange('estimatedRevenueLoss', e.target.value)}
                    placeholder="예: 50000"
                    className={`${styles.input} ${errors.estimatedRevenueLoss ? styles.error : ''}`}
                    min="0"
                  />
                  {errors.estimatedRevenueLoss && <span className={styles.errorText}>{errors.estimatedRevenueLoss}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    영향받는 주문 수 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.affectedOrderCount}
                    onChange={(e) => handleInputChange('affectedOrderCount', e.target.value)}
                    placeholder="예: 10"
                    className={`${styles.input} ${errors.affectedOrderCount ? styles.error : ''}`}
                    min="0"
                  />
                  {errors.affectedOrderCount && <span className={styles.errorText}>{errors.affectedOrderCount}</span>}
                </div>
              </>
            )}
          </form>
        </div>

        <div className={styles.footer}>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : requiresApproval ? '승인 요청' : '변경하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

PosStatusChangeDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  currentStatus: PropTypes.string.isRequired,
  targetStatus: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  requiresApproval: PropTypes.bool,
};

PosStatusChangeDialog.defaultProps = {
  requiresApproval: false,
};

export default PosStatusChangeDialog; 
