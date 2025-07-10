import React, { useState, useEffect } from 'react';
import styles from './PosOrderDetailModal.module.css';
import { orderAPI } from '../../services/orderAPI';
import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../../constants/orderTypes';
import Button from '../basic/Button';
import TextInput from '../basic/TextInput';
import { useToast } from '../../contexts/ToastContext';

export const PosOrderDetailModal = ({ orderId, onClose }) => {
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookTime, setCookTime] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // 주문 상세 정보 조회
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrderDetail(orderId);
      setOrder(response);
      setError(null);
    } catch (err) {
      setError('주문 정보를 불러오는데 실패했습니다.');
      console.error('Failed to fetch order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // 주문 처리 핸들러
  const handleOrderAction = async (action) => {
    try {
      let response;
      switch (action) {
        case 'accept':
          response = await orderAPI.acceptOrder(orderId);
          break;
        case 'reject':
          if (!rejectReason) {
            alert('거절 사유를 입력해주세요.');
            return;
          }
          response = await orderAPI.rejectOrder(orderId, rejectReason);
          break;
        case 'startCooking':
          if (!cookTime) {
            alert('예상 조리 시간을 입력해주세요.');
            return;
          }
          response = await orderAPI.startCooking(orderId, parseInt(cookTime));
          console.log('조리 시작 응답:', response);
          break;
        case 'ready':
          response = await orderAPI.markOrderAsReady(orderId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response?.data?.success) {
        onClose();
      } else if (response?.deliveryEta) {
        addToast({
          message: `설정한 예상 조리 완료 시간: ${response.deliveryEta}`,
          type: 'info'
        });
        onClose();
      }
    } catch (err) {
      console.error('Failed to process order:', err);
      addToast({
        message: '주문 처리 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>주문 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.error}>{error}</div>
          <Button onClick={onClose} variant="secondary">닫기</Button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>주문 상세 정보</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span>주문 번호:</span>
              <span>&nbsp;{order.orderNumber}</span>
            </div>
            <div className={styles.infoRow}>
              <span>주문 상태:</span>
              <span>{ORDER_STATUS_LABEL[order.orderStatus]}</span>
            </div>
            <div className={styles.infoRow}>
              <span>주문 시간:</span>
              <span>{new Date(order.orderTime).toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.itemList}>
            <h4>주문 메뉴</h4>
            {order.menuItems.map((item, index) => (
              <div key={`${order.orderId}-${item.name}-${item.quantity}-${index}`} className={styles.item}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.menuName}</span>
                  <span className={styles.itemQuantity}>x {item.quantity}</span>
                </div>
                {item.options?.map((optionGroup, ogIndex) => (
                  <div key={`${order.orderId}-${item.menuName}-${optionGroup.optionGroupName}-${ogIndex}`} className={styles.itemOption}>
                    <div>{optionGroup.optionGroupName}</div>
                    {optionGroup.options.map((option, optIndex) => (
                      <div key={`${order.orderId}-${item.menuName}-${optionGroup.optionGroupName}-${option.optionName}-${optIndex}`}>
                        - {option.optionName} ({option.optionPrice.toLocaleString()}원)
                      </div>
                    ))}
                  </div>
                ))}
                <div className={styles.itemPrice}>
                  {(item.menuPrice).toLocaleString()}원
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalPrice}>
            <span>총 결제 금액</span>
            <span>{order.totalPrice.toLocaleString()}원</span>
          </div>

          {order.orderStatus === ORDER_STATUS.WAITING && (
            <div className={styles.actions}>
              <div className={styles.inputGroup}>
                <Button 
                  onClick={() => handleOrderAction('accept')}
                  variant="primary"
                >
                  주문 수락
                </Button>
              </div>
              <div className={styles.inputGroup}>
                <TextInput
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거절 사유"
                />
                <Button 
                  onClick={() => handleOrderAction('reject')}
                  variant="danger"
                >
                  주문 거절
                </Button>
              </div>
            </div>
          )}

          {order.orderStatus === ORDER_STATUS.ACCEPTED && (
            <div className={styles.actions}>
              <div className={styles.inputGroup}>
                <TextInput
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  placeholder="예상 조리 시간 (분)"
                />
                <Button 
                  onClick={() => handleOrderAction('startCooking')}
                  variant="primary"
                >
                  조리 시작
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
