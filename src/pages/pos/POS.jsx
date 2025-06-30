import React, { useState, useEffect } from 'react';
import PosMetricItem from "../../components/pos/PosMetricItem";
import PosQuickAccess from "../../components/pos/PosQuickAccess";
import styles from "./Pos.module.css";
import PosStatusBadge from '../../components/pos/PosStatusBadge';
import PosStatusControl from '../../components/pos/PosStatusControl';
import PosAutoSettings from '../../components/pos/PosAutoSettings';
import PosStatusHistory from '../../components/pos/PosStatusHistory';
import POS_API from '../../services/posAPI';
import { POS_STATUS } from '../../constants/posStatus';

const POS = () => {
  const [posStatus, setPosStatus] = useState(POS_STATUS.CLOSED);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    autoOpen: false,
    autoOpenTime: '09:00',
    autoClose: false,
    autoCloseTime: '23:00',
  });
  const [statusHistory, setStatusHistory] = useState([]);

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 병렬로 데이터 요청
        const [statusData, settingsData, historyData] = await Promise.all([
          POS_API.getPosStatus(),
          POS_API.getPosSettings(),
          POS_API.getPosStatusHistory(),
        ]);

        setPosStatus(statusData.status);
        setSettings(settingsData);
        setStatusHistory(historyData.history);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('Failed to fetch POS data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleStatusChange = async (newStatus) => {
    try {
      setError(null);
      await POS_API.updatePosStatus(newStatus);
      setPosStatus(newStatus);
      
      // 히스토리에 새로운 상태 추가
      const newHistoryItem = {
        status: newStatus,
        timestamp: new Date().toISOString(),
      };
      setStatusHistory([newHistoryItem, ...statusHistory]);
    } catch (err) {
      setError('상태 변경에 실패했습니다.');
      console.error('Failed to update POS status:', err);
    }
  };

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

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.statusSection}>
        <h2>POS 상태 관리</h2>
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
