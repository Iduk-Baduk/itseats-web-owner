import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS } from '../../constants/posStatus';
import PosStatusBadge from './PosStatusBadge';
import styles from './PosStatusHistory.module.css';

const ITEMS_PER_PAGE = 10;

const getDateString = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateForDisplay = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${month}월 ${day}일`;
};

const PosStatusHistory = ({ history }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { filteredHistory, availableDates } = useMemo(() => {
    // 날짜별로 그룹화
    const groupedHistory = history.reduce((acc, item) => {
      const date = getDateString(item.timestamp);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // 날짜 목록 생성 및 정렬
    const dates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

    // 선택된 날짜 또는 가장 최근 날짜의 기록 필터링
    const targetDate = selectedDate || dates[0];
    const filtered = targetDate ? groupedHistory[targetDate] || [] : [];

    // 시간순 정렬 (내림차순)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      filteredHistory: filtered,
      availableDates: dates,
    };
  }, [history, selectedDate]);

  // 현재 페이지의 아이템만 선택
  const paginatedHistory = useMemo(() => {
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

  if (history.length === 0) {
    return <div className={styles.emptyState}>상태 변경 기록이 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>상태 변경 기록</h3>
        <select
          className={styles.dateSelect}
          value={selectedDate || availableDates[0] || ''}
          onChange={handleDateChange}
          aria-label="날짜 선택"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>
              {formatDateForDisplay(date)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.historyList}>
        {paginatedHistory.map((item, index) => (
          <div key={`${item.timestamp}-${index}`} className={styles.historyItem}>
            <time
              className={styles.timestamp}
              dateTime={item.timestamp}
              aria-label={new Date(item.timestamp).toLocaleTimeString('ko-KR')}
            >
              {new Date(item.timestamp).toLocaleTimeString('ko-KR')}
            </time>
            <PosStatusBadge status={item.status} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
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
  history: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
    timestamp: PropTypes.string.isRequired
  })).isRequired
};

export default PosStatusHistory; 
