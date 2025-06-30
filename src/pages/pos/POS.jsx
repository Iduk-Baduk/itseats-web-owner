import React, { useState, useEffect } from 'react';
import PosMetricItem from "../../components/pos/PosMetricItem";
import PosQuickAccess from "../../components/pos/PosQuickAccess";
import styles from "./Pos.module.css";
import PosStatusBadge from '../../components/pos/PosStatusBadge';
import PosStatusControl from '../../components/pos/PosStatusControl';
import PosAutoSettings from '../../components/pos/PosAutoSettings';
import PosStatusHistory from '../../components/pos/PosStatusHistory';
import { POS_STATUS } from '../../constants/posStatus';

const POS = () => {
  const [posStatus, setPosStatus] = useState(POS_STATUS.CLOSED);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    autoOpen: false,
    autoOpenTime: '09:00',
    autoClose: false,
    autoCloseTime: '23:00',
  });
  const [statusHistory, setStatusHistory] = useState([]);

  // Mock API 호출을 시뮬레이션
  useEffect(() => {
    const fetchPosData = async () => {
      try {
        const response = await fetch('/data/db.json');
        const data = await response.json();
        setPosStatus(data.pos.currentStatus);
        setSettings(data.pos.settings);
        setStatusHistory(data.pos.statusHistory);
      } catch (error) {
        console.error('Failed to fetch POS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosData();
  }, []);

  const handleStatusChange = async (newStatus) => {
    try {
      setPosStatus(newStatus);
      // 히스토리에 새로운 상태 추가
      const newHistoryItem = {
        status: newStatus,
        timestamp: new Date().toISOString(),
      };
      setStatusHistory([newHistoryItem, ...statusHistory]);
      // TODO: API 연동 시 실제 API 호출 추가
    } catch (error) {
      console.error('Failed to update POS status:', error);
    }
  };

  const handleSettingsChange = async (newSettings) => {
    try {
      setSettings(newSettings);
      // TODO: API 연동 시 실제 API 호출 추가
    } catch (error) {
      console.error('Failed to update POS settings:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusSection}>
        <h2>POS 상태 관리</h2>
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
        />
        <PosStatusHistory history={statusHistory} />
      </div>
      <PosMetricItem
        metricName={dummyData.storeName}
        metricValue={dummyData.metrics}
        className={styles.posMetricItem}
      />
      <PosQuickAccess className={styles.posQuickAccess} />
    </div>
  );
};

const dummyData = {
  storeName: "스타벅스 커피",
  metrics: {
    customerRating: 2.0,
    avgCookTime: "20분",
    cookTimeAccuracy: "98%",
    pickupTime: "43초",
    orderAcceptanceRate: "100%",
  },
};

export default POS;
