import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS } from '../../constants/posStatus';
import PosStatusBadge from './PosStatusBadge';
import styles from './PosStatusHistory.module.css';

const ITEMS_PER_PAGE = 10;

const PosStatusHistory = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');

  const filteredAndSortedHistory = useMemo(() => {
    // 날짜별로 그룹화
    const groupedHistory = history.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});

    // 날짜 필터링
    const dates = Object.keys(groupedHistory);
    const targetDate = selectedDate || dates[0];
    const filteredHistory = targetDate ? groupedHistory[targetDate] || [] : [];

    // 시간순 정렬 (최신순)
    return filteredHistory.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [history, selectedDate]);

  const totalPages = Math.ceil(filteredAndSortedHistory.length / ITEMS_PER_PAGE);
  const currentItems = filteredAndSortedHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const availableDates = useMemo(() => {
    const dates = new Set(
      history.map(item => 
        new Date(item.timestamp).toLocaleDateString()
      )
    );
    return Array.from(dates).sort().reverse();
  }, [history]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // 날짜 변경시 첫 페이지로 이동
  };

  if (history.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>상태 변경 기록</h3>
        <p className={styles.emptyMessage}>상태 변경 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>상태 변경 기록</h3>
        <select
          className={styles.dateSelect}
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          aria-label="날짜 선택"
        >
          {availableDates.map(date => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.historyList}>
        {currentItems.map((item, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
            <PosStatusBadge status={item.status} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

PosStatusHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.oneOf(Object.values(POS_STATUS)).isRequired,
      timestamp: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PosStatusHistory; 
