import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './PosOrders.module.css';
import { PosOrderList } from '../../components/pos/PosOrderList';
import PosStatsDashboard from '../../components/pos/PosStatsDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { POS_STATUS } from '../../constants/posStatus';
import PosStatusBadge from '../../components/pos/PosStatusBadge';
import PosStatusControl from '../../components/pos/PosStatusControl';
import { orderAPI } from '../../services/orderAPI';
import POS_API from '../../services/posAPI';

export const PosOrders = () => {
  const { currentUser: user } = useAuth();
  const { posStatus, setPosStatus, setIsReceivingOrders, isStatusLoading } = useOutletContext();
  const storeId = user?.storeId;
  const [orders, setOrders] = useState([]);

  // 상태 변경 핸들러
  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      setPosStatus(newStatus);
      setIsReceivingOrders(newStatus === POS_STATUS.OPEN);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('posStatus', newStatus);
      localStorage.setItem('isReceivingOrders', JSON.stringify(newStatus === POS_STATUS.OPEN));
    } catch (err) {
      console.error('Failed to update POS status:', err);
    }
  }, [setPosStatus, setIsReceivingOrders]);

  // 주문 목록 조회
  const fetchOrders = async () => {
    if (!storeId) return;
    
    try {
      const response = await orderAPI.getOrders(storeId);
      const newOrders = response.data.orders || [];
      setOrders(newOrders);
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, [storeId]);

  if (!storeId) {
    return (
      <div className={styles.error}>
        매장 정보를 찾을 수 없습니다.
      </div>
    );
  }

  // 로딩 중이어도 저장된 상태가 있으면 즉시 표시
  if (isStatusLoading && !localStorage.getItem('posStatus')) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>매장 상태를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{user?.storeName || '매장'}</h1>
        <div className={styles.statusSection}>
          <div className={styles.statusBadge}>
            <PosStatusBadge status={posStatus} />
          </div>
          <PosStatusControl
            currentStatus={posStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
      <div className={styles.statsSection}>
        <PosStatsDashboard orders={orders} />
      </div>
      <div className={styles.ordersSection}>
        <PosOrderList 
          storeId={storeId} 
          isReceivingOrders={posStatus === POS_STATUS.OPEN}
          onOrdersUpdate={fetchOrders}
        />
      </div>
    </div>
  );
};
