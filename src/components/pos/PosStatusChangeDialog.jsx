import React, { useState } from 'react';
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
  requiresApproval = false,
  error
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
      // 성공하면 다이얼로그를 닫음 (onConfirm에서 처리됨)
    } catch (error) {
      // 에러 발생 시 다이얼로그를 열린 상태로 유지하고 에러만 표시
      console.error('Status change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div 
        className={styles.dialog}
        role="dialog"
        aria-label="상태 변경"
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
              <label className={styles.label} htmlFor="status-reason">
                변경 사유 <span className={styles.required}>*</span>
              </label>
              <select
                id="status-reason"
                name="reason"
                className={`${styles.select} ${!formData.reason ? styles.empty : ''}`}
                value={formData.reason}
                onChange={handleChange}
                aria-label="변경 사유"
                required
              >
                <option value="">사유를 선택하세요</option>
                {availableReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
                <option value="custom">직접 입력</option>
              </select>
            </div>

            {/* 커스텀 사유 입력 */}
            {formData.reason === 'custom' && (
              <div className={styles.field}>
                <label className={styles.label}>
                  사유 입력 <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="customReason"
                  value={formData.customReason}
                  onChange={handleChange}
                  placeholder="변경 사유를 입력하세요"
                  className={`${styles.input} ${errors.customReason ? styles.error : ''}`}
                />
              </div>
            )}

            {/* 메모 */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="status-notes">
                메모
              </label>
              <textarea
                id="status-notes"
                name="notes"
                className={styles.textarea}
                value={formData.notes}
                onChange={handleChange}
                placeholder="추가 설명이나 메모를 입력하세요"
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
                    name="estimatedRevenueLoss"
                    value={formData.estimatedRevenueLoss}
                    onChange={handleChange}
                    placeholder="예: 50000"
                    className={`${styles.input} ${errors.estimatedRevenueLoss ? styles.error : ''}`}
                    min="0"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    영향받는 주문 수 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="affectedOrderCount"
                    value={formData.affectedOrderCount}
                    onChange={handleChange}
                    placeholder="예: 10"
                    className={`${styles.input} ${errors.affectedOrderCount ? styles.error : ''}`}
                    min="0"
                  />
                </div>
              </>
            )}

            {error && <div className={styles.error}>{error}</div>}
            
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
          </form>
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
  error: PropTypes.string,
};

PosStatusChangeDialog.defaultProps = {
  requiresApproval: false,
};

export default PosStatusChangeDialog; 
