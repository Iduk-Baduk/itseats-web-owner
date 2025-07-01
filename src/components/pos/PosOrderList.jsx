import React, { useState, useEffect, useRef } from 'react';
import styles from './PosOrderList.module.css';
import Button from '../basic/Button';
import ComboBox from '../basic/ComboBox';
import { ORDER_STATUS, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, ORDER_FILTERS } from '../../constants/orderTypes';
import { orderAPI } from '../../services/orderAPI';
import { NOTIFICATION_SOUNDS } from '../../constants/sounds';
import { PosOrderDetailModal } from './PosOrderDetailModal';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';

export const PosOrderList = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const previousOrdersRef = useRef([]);
  const { addToast } = useToast();

  // 주문 목록 조회
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders(storeId);
      const newOrders = response.data.orders || [];
      
      // 새로운 주문 확인
      const prevOrderIds = new Set(previousOrdersRef.current.map(order => order.id));
      const newPendingOrders = newOrders.filter(
        order => order.status === ORDER_STATUS.PENDING && !prevOrderIds.has(order.id)
      );

      // 새로운 주문이 있으면 알림
      if (newPendingOrders.length > 0) {
        addToast({
          message: `새로운 주문이 ${newPendingOrders.length}건 있습니다.`,
          type: 'info',
          sound: NOTIFICATION_SOUNDS.NEW_ORDER,
        });
      }

      setOrders(newOrders);
      previousOrdersRef.current = newOrders;
      setError(null);
    } catch (err) {
      setError('주문 목록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 업데이트 처리
  const handleOrderAction = async (orderId, action) => {
    if (!orderId) {
      addToast({
        message: '주문 ID가 없습니다.',
        type: 'error',
      });
      return;
    }

    try {
      let response;
      switch (action) {
        case 'accept':
          response = await orderAPI.acceptOrder(orderId);
          if (response.data.success) {
            addToast({
              message: '주문이 수락되었습니다.',
              type: 'success',
              sound: NOTIFICATION_SOUNDS.ORDER_ACCEPTED,
            });
          }
          break;
        case 'reject':
          response = await orderAPI.rejectOrder(orderId);
          if (response.data.success) {
            addToast({
              message: '주문이 거절되었습니다.',
              type: 'warning',
              sound: NOTIFICATION_SOUNDS.ORDER_REJECTED,
            });
          }
          break;
        case 'ready':
          response = await orderAPI.markOrderAsReady(orderId);
          if (response.data.success) {
            addToast({
              message: '조리가 완료되었습니다.',
              type: 'success',
              sound: NOTIFICATION_SOUNDS.ORDER_READY,
            });
          }
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      addToast({
        message: '주문 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => 
    (filter === 'ALL' || order.status === filter) &&
    order.status !== 'READY' && // 조리완료된 주문은 제외
    order.status !== 'REJECTED' // 거절된 주문도 제외
  );

  // 주문 상태별 개수 계산
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // 주문처리현황 업데이트
  useEffect(() => {
    const updateStats = async () => {
      try {
        await apiClient.patch(`/daily_stats/${storeId}`, {
          pendingOrders: orderCounts['PENDING'] || 0,
          processingOrders: orderCounts['ACCEPTED'] || 0,
          completedOrders: orderCounts['READY'] || 0
        });
      } catch (error) {
        console.error('Failed to update order stats:', error);
      }
    };

    updateStats();
  }, [orderCounts, storeId]);

  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    fetchOrders();
    
    // 실시간 업데이트를 위한 폴링 설정
    const pollInterval = setInterval(fetchOrders, 30000); // 30초마다 갱신
    
    return () => clearInterval(pollInterval);
  }, [storeId]);

  if (loading && orders.length === 0) {
    return <div className={styles.loading}>주문 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>주문 관리</h2>
        <ComboBox
          options={ORDER_FILTERS}
          value={filter}
          onChange={(value) => setFilter(value)}
          className={styles.filter}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'ALL' ? '주문이 없습니다.' : '해당 상태의 주문이 없습니다.'}
        </div>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map((order) => (
            <div 
              key={`order-${order.orderId}-${order.status}`} 
              className={styles.orderCard}
              onClick={() => setSelectedOrderId(order.orderId)}
            >
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>주문 #{order.orderId}</span>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: ORDER_STATUS_COLOR[order.status] }}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              
              <div className={styles.orderItems}>
                {order.items.map((item, index) => (
                  <div key={`${order.orderId}-${item.name}-${item.quantity}-${index}`} className={styles.item}>
                    <span>{item.name}</span>
                    <span>x {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <span className={styles.total}>
                  총 {order.totalAmount.toLocaleString()}원
                </span>
                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                  {order.status === ORDER_STATUS.PENDING && (
                    <>
                      <Button 
                        onClick={() => handleOrderAction(order.orderId, 'accept')}
                        variant="primary"
                      >
                        수락
                      </Button>
                      <Button 
                        onClick={() => handleOrderAction(order.orderId, 'reject')}
                        variant="danger"
                      >
                        거절
                      </Button>
                    </>
                  )}
                  {order.status === ORDER_STATUS.ACCEPTED && (
                    <Button 
                      onClick={() => handleOrderAction(order.orderId, 'ready')}
                      variant="success"
                    >
                      조리완료
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrderId && (
        <PosOrderDetailModal
          orderId={selectedOrderId}
          onClose={() => {
            setSelectedOrderId(null);
            fetchOrders(); // 모달이 닫힐 때 목록 새로고침
          }}
        />
      )}
    </div>
  );
}; 
