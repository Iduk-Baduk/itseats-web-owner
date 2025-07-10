import React, { useState, useEffect, useRef } from 'react';
import styles from './PosOrderList.module.css';
import Button from '../basic/Button';
import ComboBox from '../basic/ComboBox';
import { ORDER_STATUS, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, ORDER_FILTERS } from '../../constants/orderTypes';
import { orderAPI } from '../../services/orderAPI';
import { PosOrderDetailModal } from './PosOrderDetailModal';
import { useToast } from '../../contexts/ToastContext';

export const PosOrderList = ({ storeId, onOrdersUpdate }) => {
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
          type: 'info'
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

  // 필터링된 주문 목록
  const filteredOrders = orders.filter(order => {
    // 배달완료된 주문은 항상 숨김처리
    if (order.orderStatus === ORDER_STATUS.COMPLETED) {
      return false;
    }

    // 오늘 날짜의 시작과 끝
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘의 주문만 필터링
    const orderDate = new Date(order.orderTime || order.createdAt);
    const isTodayOrder = orderDate >= today && orderDate < tomorrow;

    if (!isTodayOrder) {
      return false;
    }

    // 필터가 ALL이면 배달완료를 제외한 모든 주문 표시, 아니면 해당 상태의 주문만 표시
    return filter === 'ALL' || order.orderStatus === filter;
  });

  // 주문 상태별 개수 계산 (오늘 날짜 기준)
  const orderCounts = orders.reduce((acc, order) => {
    // 오늘 날짜의 시작과 끝
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘의 주문만 필터링
    const orderDate = new Date(order.orderTime || order.createdAt);
    const isTodayOrder = orderDate >= today && orderDate < tomorrow;

    if (isTodayOrder) {
      acc[order.status] = (acc[order.status] || 0) + 1;
    }
    return acc;
  }, {});



  // 컴포넌트 마운트 시 주문 목록 조회
  useEffect(() => {
    fetchOrders();
    
    // 실시간 업데이트를 위한 폴링 설정
    const pollInterval = setInterval(fetchOrders, 30000); // 30초마다 갱신
    
    return () => clearInterval(pollInterval);
  }, [storeId]);

  // 주문 상태 업데이트 처리
  const handleOrderAction = async (orderId, action) => {
    if (!orderId) {
      addToast({
        message: '주문 ID가 없습니다.',
        type: 'error'
      });
      return;
    }

    try {
      let response;
      let successMessage = '';

      switch (action) {
        case 'accept':
          setSelectedOrderId(orderId); // 예상 조리 시간 입력을 위해 모달 열기
          return;
        case 'reject':
          setSelectedOrderId(orderId); // 거절 사유 입력을 위해 모달 열기
          return;
        case 'startCooking':
          setSelectedOrderId(orderId); // 조리 예상 시간 입력을 위해 모달 열기
          return;
        case 'ready':
          response = await orderAPI.markOrderAsReady(orderId);
          successMessage = '조리가 완료되었습니다.';
          break;
        case 'startDelivery':
          response = await orderAPI.startDelivery(orderId);
          successMessage = '배달이 시작되었습니다.';
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.data.success) {
        addToast({
          message: successMessage,
          type: 'success'
        });
        await fetchOrders();
        // 상위 컴포넌트에 주문 목록 업데이트 알림
        if (onOrdersUpdate) {
          onOrdersUpdate();
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      addToast({
        message: '주문 처리 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  };

  if (loading && orders.length === 0) {
    return <div className={styles.loading}>주문 목록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // 주문 상태별 버튼 렌더링
  const getOrderActions = (order) => {
    switch (order.orderStatus) {
      case ORDER_STATUS.WAITING:
        return (
          <div className={styles.actionsFlex}>
            <Button onClick={() => handleOrderAction(order.orderId || order.id, 'accept')} variant="primary">수락</Button>
            <Button onClick={() => handleOrderAction(order.orderId || order.id, 'reject')} variant="danger">거절</Button>
          </div>
        );
      case ORDER_STATUS.ACCEPTED:
        return (
          <Button onClick={() => handleOrderAction(order.orderId || order.id, 'startCooking')} variant="primary">조리시작</Button>
        );
      case ORDER_STATUS.COOKING:
        return (
          <Button onClick={() => handleOrderAction(order.orderId || order.id, 'ready')} variant="primary">조리완료</Button>
        );
      case ORDER_STATUS.COOKED:
        return <p>배차 대기 중</p>;
      case ORDER_STATUS.RIDER_READY:
      case ORDER_STATUS.ARRIVED:
        return (
          <Button onClick={() => handleOrderAction(order.orderId || order.id, 'startDelivery')} variant="primary">음식전달 완료</Button>
        );
      case ORDER_STATUS.DELIVERING:
        return <p>배달 중</p>;
      case ORDER_STATUS.DELIVERED:
        return <p>배달 완료</p>;
      case ORDER_STATUS.COMPLETED:
        return <p>주문 완료</p>;
      case ORDER_STATUS.REJECTED:
        return <p>주문 거절됨</p>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>주문 관리</h2>
        <ComboBox
          options={ORDER_FILTERS}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
              key={`order-${order.orderNumber}-${order.status}`} 
              className={styles.orderCard}
              onClick={() => setSelectedOrderId(order.orderId)}
            >
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>주문 {order.orderNumber}</span>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: ORDER_STATUS_COLOR[order.orderStatus] }}
                >
                  {ORDER_STATUS_LABEL[order.orderStatus]}
                </span>
              </div>
              
              <div className={styles.orderItems}>
                {order.menuItems.map((item, index) => (
                  <div key={`${order.orderId}-${item.menuName}-${item.quantity}-${index}`} className={styles.item}>
                    <span>{item.menuName}</span>
                    <span>x {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.actions}>
                  {getOrderActions(order)}
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
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}; 
