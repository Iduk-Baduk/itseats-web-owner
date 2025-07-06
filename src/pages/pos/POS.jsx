import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PosMetricItem from "../../components/pos/PosMetricItem";
import PosQuickAccess from "../../components/pos/PosQuickAccess";
import styles from "./POS.module.css";
import PosStatusBadge from '../../components/pos/PosStatusBadge';
import PosStatusControl from '../../components/pos/PosStatusControl';
import PosAutoSettings from '../../components/pos/PosAutoSettings';
import PosStatusHistory from '../../components/pos/PosStatusHistory';
import PosNotificationCenter from '../../components/pos/PosNotificationCenter';
import POS_API from '../../services/posAPI';
import usePosAutoScheduler from '../../hooks/usePosAutoScheduler';
import { POS_STATUS } from '../../constants/posStatus';
import { useAuth } from '../../contexts/AuthContext';

const POS = () => {
  const { currentUser } = useAuth();
  const { posStatus, setPosStatus, setIsReceivingOrders, isStatusLoading } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    autoOpen: false,
    autoOpenTime: '09:00',
    autoClose: false,
    autoCloseTime: '23:00',
  });
  const [statusHistory, setStatusHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    customerRating: 0,
    avgCookTime: "0분",
    cookTimeAccuracy: "0%",
    pickupTime: "0초",
    orderAcceptanceRate: "0%"
  });

  // 메트릭 데이터 로드
  const loadMetrics = useCallback(async () => {
    try {
      const analytics = await POS_API.getPosAnalytics();
      setMetrics(analytics.metrics || {
        customerRating: 0,
        avgCookTime: "0분",
        cookTimeAccuracy: "0%",
        pickupTime: "0초",
        orderAcceptanceRate: "0%"
      });
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  }, []);

  // 상태 변경 핸들러
  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      setError(null);
      setPosStatus(newStatus);
      setIsReceivingOrders(newStatus === POS_STATUS.OPEN);
      
      // 히스토리 새로고침
      const historyData = await POS_API.getPosStatusHistory();
      setStatusHistory(historyData.history);
      
      // 알림 새로고침
      await loadNotifications();
      
      // 메트릭 새로고침
      await loadMetrics();
    } catch (err) {
      setError('상태 변경에 실패했습니다.');
      console.error('Failed to update POS status:', err);
    }
  }, [loadMetrics, setPosStatus, setIsReceivingOrders]);

  // 알림 로드
  const loadNotifications = async () => {
    try {
      const notificationList = await POS_API.getNotifications();
      setNotifications(notificationList);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  // 자동화 스케줄러 적용
  const { resetDailyProcessing } = usePosAutoScheduler(settings, handleStatusChange);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          loadMetrics(),
          loadNotifications(),
          (async () => {
            const historyData = await POS_API.getPosStatusHistory();
            setStatusHistory(historyData.history);
          })(),
          (async () => {
            const settingsData = await POS_API.getPosAutoSettings();
            setSettings(settingsData);
          })()
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('데이터 로드에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [loadMetrics]);

  const handleSettingsChange = async (newSettings) => {
    try {
      setError(null);
      await POS_API.updatePosSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError('설정 변경에 실패했습니다.');
      console.error('Failed to update POS settings:', err);
    }
  };

  // 읽지 않은 알림 수
  const unreadNotificationCount = notifications.filter(notif => !notif.isRead).length;

  if (isLoading || isStatusLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toast 알림 컨테이너 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      {/* 헤더 영역 */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>POS 관리</h1>
        <button 
          className={styles.notificationButton}
          onClick={() => setIsNotificationCenterOpen(true)}
          aria-label="알림 센터 열기"
        >
          🔔 알림
          {unreadNotificationCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadNotificationCount}
            </span>
          )}
        </button>
      </div>

      <PosQuickAccess className={styles.posQuickAccess} />

      <div className={styles.statusSection}>
        <h2>{currentUser?.storeName || '매장'}</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.currentStatus}>
          <span>현재 상태:</span>
          <PosStatusBadge status={posStatus} />
        </div>
        
        <PosStatusControl
          currentStatus={posStatus}
          onStatusChange={handleStatusChange}
        />

        <PosAutoSettings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onResetDailyProcessing={resetDailyProcessing}
        />

        <PosMetricItem
          metricName={currentUser?.storeName || "매장 정보 없음"}
          metricValue={metrics}
          className={styles.posMetricItem}
        />
        
        <PosStatusHistory history={statusHistory} />
      </div>

      {/* 알림 센터 */}
      <PosNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
};

export default POS;
