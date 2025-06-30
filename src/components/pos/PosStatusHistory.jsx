import React from 'react';
import PropTypes from 'prop-types';
import { POS_STATUS } from '../../constants/posStatus';
import PosStatusBadge from './PosStatusBadge';
import styles from './PosStatusHistory.module.css';

const PosStatusHistory = ({ history }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>상태 변경 기록</h3>
      
      {history.length > 0 ? (
        <div className={styles.historyList}>
          {history.map((item, index) => (
            <div key={index} className={styles.historyItem}>
              <span className={styles.timestamp}>
                {formatTimestamp(item.timestamp)}
              </span>
              <PosStatusBadge status={item.status} />
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noHistory}>상태 변경 기록이 없습니다.</p>
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
