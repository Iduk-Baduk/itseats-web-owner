import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  NOTIFICATION_SEVERITY, 
  NOTIFICATION_SEVERITY_STYLE,
  NOTIFICATION_TYPE 
} from '../../constants/posStatus';
import posAPI from '../../services/posAPI';
import styles from './PosNotificationCenter.module.css';

const PosNotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'status_change'

  // 알림 목록 로드
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const notificationList = await posAPI.getNotifications();
      setNotifications(notificationList);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      await posAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      await posAPI.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'status_change') return notif.type === NOTIFICATION_TYPE.STATUS_CHANGE;
    return true;
  });

  // 읽지 않은 알림 수
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityStyle = (severity) => {
    return NOTIFICATION_SEVERITY_STYLE[severity] || NOTIFICATION_SEVERITY_STYLE.INFO;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case NOTIFICATION_SEVERITY.SUCCESS: return '✅';
      case NOTIFICATION_SEVERITY.WARNING: return '⚠️';
      case NOTIFICATION_SEVERITY.ERROR: return '❌';
      default: return 'ℹ️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>
              알림 센터
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </h3>
            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                전체
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
                onClick={() => setFilter('unread')}
              >
                읽지 않음 ({unreadCount})
              </button>
              <button
                className={`${styles.filterButton} ${filter === 'status_change' ? styles.active : ''}`}
                onClick={() => setFilter('status_change')}
              >
                상태 변경
              </button>
            </div>
          </div>
          <div className={styles.actions}>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllButton}
                onClick={markAllAsRead}
              >
                모두 읽음
              </button>
            )}
            <button 
              className={styles.closeButton}
              onClick={onClose}
              aria-label="닫기"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <span>알림을 불러오는 중...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔔</div>
              <h4>알림이 없습니다</h4>
              <p>
                {filter === 'unread' 
                  ? '읽지 않은 알림이 없습니다.' 
                  : filter === 'status_change'
                  ? '상태 변경 알림이 없습니다.'
                  : '새로운 알림이 없습니다.'
                }
              </p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className={styles.notificationIcon}>
                    {getSeverityIcon(notification.severity)}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.notificationTitle}>
                        {notification.title}
                      </h4>
                      <span className={styles.notificationTime}>
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <div 
                      className={styles.severityIndicator}
                      style={getSeverityStyle(notification.severity)}
                    >
                      {notification.severity}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className={styles.unreadDot}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.refreshButton}
            onClick={loadNotifications}
            disabled={isLoading}
          >
            {isLoading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>
      </div>
    </div>
  );
};

PosNotificationCenter.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PosNotificationCenter; 
