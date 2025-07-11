import React, { useEffect, useState } from 'react';
import styles from './PosStatsDashboard.module.css';
import { fetchTopMenus } from '../../services/orderAPI';
import { useAuth } from '../../contexts/AuthContext';
import { ORDER_STATUS } from '../../constants/orderTypes';

const StatCard = ({ title, value, icon }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statTitle}>{title}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
);

const PosStatsDashboard = ({ orders = [] }) => {
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

  const calculateStats = (orderList) => {
    // 오늘 날짜의 시작과 끝
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘의 주문만 필터링
    const todayOrders = orderList.filter(order => {
      const orderDate = new Date(order.orderTime || order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });

    // 상태별 주문 수 계산
    const pendingOrders = todayOrders.filter(order => order.orderStatus === ORDER_STATUS.WAITING).length;
    const processingOrders = todayOrders.filter(order => 
      order.orderStatus === ORDER_STATUS.ACCEPTED ||
      order.orderStatus === ORDER_STATUS.COOKING ||
      order.orderStatus === ORDER_STATUS.COOKED ||
      order.orderStatus === ORDER_STATUS.RIDER_READY ||
      order.orderStatus === ORDER_STATUS.ARRIVED
    ).length;
    const completedOrders = todayOrders.filter(order => 
      order.orderStatus === ORDER_STATUS.DELIVERING || 
      order.orderStatus === ORDER_STATUS.DELIVERED || 
      order.orderStatus === ORDER_STATUS.COMPLETED
    ).length;



    // 총 매출액 계산 (주문수락 이상 상태의 주문만)
    const completedOrdersData = todayOrders.filter(order => 
      order.orderStatus === ORDER_STATUS.ACCEPTED ||
      order.orderStatus === ORDER_STATUS.COOKING ||
      order.orderStatus === ORDER_STATUS.COOKED ||
      order.orderStatus === ORDER_STATUS.RIDER_READY ||
      order.orderStatus === ORDER_STATUS.ARRIVED ||
      order.orderStatus === ORDER_STATUS.DELIVERING ||
      order.orderStatus === ORDER_STATUS.DELIVERED || 
      order.orderStatus === ORDER_STATUS.COMPLETED
    );
    const totalSales = completedOrdersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // 평균 주문금액 계산
    const averageOrderAmount = completedOrdersData.length > 0
      ? Math.round(totalSales / completedOrdersData.length)
      : 0;

    return {
      totalOrders: todayOrders.length,
      totalSales,
      averageOrderAmount,
      pendingOrders,
      processingOrders,
      completedOrders
    };
  };

  const fetchTopMenusData = async () => {
    if (!currentUser?.storeId) return;
    
    try {
      const topMenusData = await fetchTopMenus(currentUser.storeId);
      setStats(prev => ({ ...prev, topMenus: topMenusData }));
    } catch (error) {
      console.error('인기 메뉴 데이터 로딩 실패:', error);
    }
  };

  useEffect(() => {
    // 주문 목록이 변경될 때마다 통계 재계산
    const newStats = calculateStats(orders);
    setStats(prev => ({ ...prev, ...newStats }));
  }, [orders]);

  useEffect(() => {
    // 인기 메뉴 데이터 로드
    fetchTopMenusData();
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
        <ul className={styles.topMenusList}>
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
