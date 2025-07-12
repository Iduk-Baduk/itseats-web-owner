import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS, STATUS_CHANGE_CATEGORY_LABEL } from '../../constants/posStatus';
import PosStatusBadge from './PosStatusBadge';
import styles from './PosStatusHistory.module.css';
import { formatRelativeTime, formatDate } from '../../utils/dateUtils';
import { parseISO, format } from 'date-fns';
import { ko } from 'date-fns/locale';

const ITEMS_PER_PAGE = 10;

const getDateString = (timestamp) => {
  if (!timestamp) return 'Invalid Date';
  try {
    const date = parseISO(timestamp);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    return 'Invalid Date';
  }
};

const formatTimeForDisplay = (timestamp) => {
  if (!timestamp) return '--:--';
  try {
    const date = parseISO(timestamp);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return '--:--';
  }
};

const formatDateForDisplay = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${month}월 ${day}일`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

// 고유 키 생성을 위한 유틸리티 함수
const generateHistoryItemKey = (item, index) => {
  if (item.id) return item.id;
  
  const components = [
    item.timestamp,
    item.status,
    item.reason,
    index
  ].filter(Boolean);
  
  return components.join('-');
};

const PosStatusHistory = ({ history }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const { filteredHistory, availableDates } = useMemo(() => {
    // 날짜별로 그룹화
    const groupedHistory = history.reduce((acc, item) => {
      const dateString = getDateString(item.timestamp);
      // 유효하지 않은 날짜는 그룹화에서 제외
      if (dateString === 'Invalid Date') {
        return acc;
      }
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(item);
      return acc;
    }, {});

    // 날짜 목록 생성 및 정렬
    const dates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));
    
    // 시간순 정렬을 위한 안전한 날짜 변환 함수
    const safeNewDate = (timestamp) => {
        try {
            return new Date(timestamp);
        } catch (e) {
            return new Date(0); // 유효하지 않은 경우 맨 뒤로 보내기 위한 값
        }
    };

    // 선택된 날짜의 기록 필터링 (선택된 날짜가 없으면 전체 기록 반환)
    const filtered = selectedDate 
      ? (groupedHistory[selectedDate] || [])
      : history.filter(item => getDateString(item.timestamp) !== 'Invalid Date');

    // 시간순 정렬 (내림차순)
    filtered.sort((a, b) => safeNewDate(b.timestamp) - safeNewDate(a.timestamp));

    return {
      filteredHistory: filtered,
      availableDates: dates,
    };
  }, [history, selectedDate]);

  // 현재 페이지의 아이템만 선택
  const paginatedHistory = useMemo(() => {
    // 전체 항목이 ITEMS_PER_PAGE보다 적으면 페이지네이션 없이 모든 항목 표시
    if (filteredHistory.length <= ITEMS_PER_PAGE) {
      return filteredHistory;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setCurrentPage(1); // 날짜가 변경되면 첫 페이지로 이동
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (history.length === 0) {
    return <div className={styles.emptyState}>상태 변경 기록이 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>상태 변경 기록</h3>
        <select
          className={styles.dateSelect}
          value={selectedDate}
          onChange={handleDateChange}
          aria-label="날짜 선택"
        >
          <option value="">전체 기록</option>
          {availableDates.map(date => {
            let formattedDate;
            try {
              formattedDate = format(parseISO(date), 'yyyy년 MM월 dd일', { locale: ko });
            } catch (error) {
              formattedDate = '유효하지 않은 날짜';
            }
            return (
              <option key={date} value={date}>
                {formattedDate}
              </option>
            );
          })}
        </select>
      </div>

      <div className={styles.historyList} role="list">
        {paginatedHistory.map((item, index) => {
          const itemKey = generateHistoryItemKey(item, index);
          const isExpanded = expandedItems.has(itemKey);
          const hasMetadata = item.reason || item.notes || item.estimatedRevenueLoss > 0;
          
          let timeTitle;
          try {
            timeTitle = format(parseISO(item.timestamp), 'yyyy-MM-dd HH:mm:ss', { timeZone: 'UTC', locale: ko });
          } catch (error) {
            timeTitle = '유효하지 않은 시간';
          }

          return (
            <div 
              key={itemKey} 
              className={styles.historyItem}
              role="listitem"
            >
              <div className={styles.historyHeader}>
                <time 
                  className={styles.timestamp}
                  dateTime={item.timestamp}
                  title={timeTitle}
                >
                  {formatTimeForDisplay(item.timestamp)}
                </time>
                <PosStatusBadge status={item.status} />
                {hasMetadata && (
                  <button
                    className={styles.expandButton}
                    onClick={() => toggleItemExpansion(itemKey)}
                    aria-label={isExpanded ? '접기' : '펼치기'}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
              </div>

              {/* 기본 정보 (항상 표시) */}
              <div className={styles.basicInfo}>
                {item.reason && (
                  <span className={styles.reason}>
                    📋 {item.reason}
                  </span>
                )}
                {item.userName && (
                  <span className={styles.userName}>
                    👤 {item.userName}
                  </span>
                )}
                {item.requiresApproval && !item.approvedBy && (
                  <span className={styles.approvalStatus}>
                    ⏳ 승인 대기 중
                  </span>
                )}
              </div>

              {/* 확장 정보 */}
              {isExpanded && hasMetadata && (
                <div className={styles.expandedInfo}>
                  {item.notes && (
                    <div className={styles.metadataRow}>
                      <span className={styles.metadataLabel}>메모:</span>
                      <span className={styles.metadataValue}>{item.notes}</span>
                    </div>
                  )}
                  
                  {item.category && (
                    <div className={styles.metadataRow}>
                      <span className={styles.metadataLabel}>분류:</span>
                      <span className={styles.categoryBadge}>
                        {STATUS_CHANGE_CATEGORY_LABEL[item.category] || item.category}
                      </span>
                    </div>
                  )}

                  {item.estimatedRevenueLoss > 0 && (
                    <div className={styles.metadataRow}>
                      <span className={styles.metadataLabel}>예상 손실:</span>
                      <span className={styles.revenueLoss}>
                        {formatCurrency(item.estimatedRevenueLoss)}
                      </span>
                    </div>
                  )}

                  {item.affectedOrderCount > 0 && (
                    <div className={styles.metadataRow}>
                      <span className={styles.metadataLabel}>영향받은 주문:</span>
                      <span className={styles.orderCount}>
                        {item.affectedOrderCount}건
                      </span>
                    </div>
                  )}

                  {item.requiresApproval && (
                    <div className={styles.metadataRow}>
                      <span className={styles.metadataLabel}>승인 정보:</span>
                      <span className={styles.approvalInfo}>
                        {item.approvedBy ? (
                          <>✅ {item.approvedBy}님이 승인</>
                        ) : (
                          <>⏳ 승인 대기 중</>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={`${page}페이지로 이동`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

PosStatusHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      timestamp: PropTypes.string.isRequired,
      status: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
      reason: PropTypes.string,
      notes: PropTypes.string,
      userName: PropTypes.string,
      category: PropTypes.string,
      estimatedRevenueLoss: PropTypes.number,
      affectedOrderCount: PropTypes.number,
      requiresApproval: PropTypes.bool,
      approvedBy: PropTypes.string
    })
  ).isRequired
};

export default PosStatusHistory;
