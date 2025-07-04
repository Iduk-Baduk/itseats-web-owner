import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './PosOrders.module.css';
import { PosOrderList } from '../../components/pos/PosOrderList';
import PosStatsDashboard from '../../components/pos/PosStatsDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { POS_STATUS } from '../../constants/posStatus';
import PosStatusBadge from '../../components/pos/PosStatusBadge';

export const PosOrders = () => {
  const { currentUser: user } = useAuth();
  const { posStatus } = useOutletContext();
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
      <div className={styles.header}>
        <h1>{user?.storeName || '매장'}</h1>
        <div className={styles.statusBadge}>
          <PosStatusBadge status={posStatus} />
        </div>
      </div>
      <div className={styles.statsSection}>
        <PosStatsDashboard storeId={storeId} />
      </div>
      <div className={styles.ordersSection}>
        <PosOrderList 
          storeId={storeId} 
          isReceivingOrders={posStatus === POS_STATUS.OPEN}
        />
      </div>
    </div>
  );
};
