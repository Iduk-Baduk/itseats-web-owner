import React, { useEffect, useState } from 'react';
import styles from './PosStatsDashboard.module.css';
import { fetchDailyStats, fetchTopMenus } from '../../services/orderAPI';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statTitle}>{title}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

const PosStatsDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    averageOrderAmount: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    topMenus: [],
    metrics: {
      customerRating: 0,
      avgCookTime: "0분",
      cookTimeAccuracy: "0%",
      pickupTime: "0초",
      orderAcceptanceRate: "0%"
    }
  });

  const fetchStats = async () => {
    if (!currentUser?.storeId) {
      console.error('매장 정보가 없습니다.');
      return;
    }

    try {
      const [dailyStats, topMenusData] = await Promise.all([
        fetchDailyStats(currentUser.storeId),
        fetchTopMenus(currentUser.storeId)
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
    const interval = setInterval(fetchStats, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, [currentUser?.storeId]);

  if (!currentUser?.storeId) {
    return (
      <div className={styles.error}>
        매장 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsGrid}>
        <StatCard
          title="오늘의 주문"
          value={stats.totalOrders}
          icon="📊"
        />
        <StatCard
          title="매출액"
          value={`₩${stats.totalSales.toLocaleString()}`}
          icon="💰"
        />
        <StatCard
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
