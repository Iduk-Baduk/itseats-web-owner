import React from 'react';
import styles from './PosOrders.module.css';
import { PosOrderList } from '../../components/pos/PosOrderList';
import PosStatsDashboard from '../../components/pos/PosStatsDashboard';
import { useAuth } from '../../contexts/AuthContext';

export const PosOrders = () => {
  const { currentUser: user } = useAuth();
  const storeId = user?.storeId;

  if (!storeId) {
    return (
      <div className={styles.error}>
        매장 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsSection}>
        <PosStatsDashboard storeId={storeId} />
      </div>
      <div className={styles.ordersSection}>
        <PosOrderList storeId={storeId} />
      </div>
    </div>
  );
};
