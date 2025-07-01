import React, { useEffect, useState } from 'react';
import styles from './PosStatsDashboard.module.css';
import { fetchDailyStats, fetchTopMenus } from '../../services/orderAPI';
import PosMetricItem from './PosMetricItem';

const PosStatsDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    averageOrderAmount: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    topMenus: []
  });

  const fetchStats = async () => {
    try {
      const [dailyStats, topMenusData] = await Promise.all([
        fetchDailyStats(),
        fetchTopMenus()
      ]);

      setStats({
        ...dailyStats,
        topMenus: topMenusData
      });
    } catch (error) {
      console.error('통계 데이터 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 300000); // 5분마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsGrid}>
        <PosMetricItem
          title="오늘의 주문"
          value={stats.totalOrders}
          icon="📊"
        />
        <PosMetricItem
          title="매출액"
          value={`₩${stats.totalSales.toLocaleString()}`}
          icon="💰"
        />
        <PosMetricItem
          title="평균 주문금액"
          value={`₩${stats.averageOrderAmount.toLocaleString()}`}
          icon="📈"
        />
      </div>

      <div className={styles.orderStatus}>
        <h3>주문 처리 현황</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>대기 중</span>
            <span className={styles.statusValue}>{stats.pendingOrders}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>처리 중</span>
            <span className={styles.statusValue}>{stats.processingOrders}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>완료</span>
            <span className={styles.statusValue}>{stats.completedOrders}</span>
          </div>
        </div>
      </div>

      <div className={styles.topMenus}>
        <h3>인기 메뉴 TOP 5</h3>
        <ul className={styles.menuList}>
          {stats.topMenus.map((menu, index) => (
            <li key={menu.id} className={styles.menuItem}>
              <span className={styles.menuRank}>{index + 1}</span>
              <span className={styles.menuName}>{menu.name}</span>
              <span className={styles.menuCount}>{menu.orderCount}회</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PosStatsDashboard; 
