import React from 'react';
import PropTypes from 'prop-types';
import styles from './PosAutoSettings.module.css';

const PosAutoSettings = ({ settings, onSettingsChange }) => {
  const handleAutoOpenChange = (e) => {
    onSettingsChange({
      ...settings,
      autoOpen: e.target.checked
    });
  };

  const handleAutoCloseChange = (e) => {
    onSettingsChange({
      ...settings,
      autoClose: e.target.checked
    });
  };

  const handleTimeChange = (field) => (e) => {
    onSettingsChange({
      ...settings,
      [field]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>자동화 설정</h3>
      <div className={styles.settingGroup}>
        <div className={styles.settingItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={settings.autoOpen}
              onChange={handleAutoOpenChange}
              aria-label="자동 오픈"
            />
            자동 오픈
          </label>
          <input
            type="time"
            value={settings.autoOpenTime || ''}
            onChange={handleTimeChange('autoOpenTime')}
            disabled={!settings.autoOpen}
            className={styles.timeInput}
            aria-label="자동 오픈 시간"
          />
        </div>
        <div className={styles.settingItem}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={settings.autoClose}
              onChange={handleAutoCloseChange}
              aria-label="자동 마감"
            />
            자동 마감
          </label>
          <input
            type="time"
            value={settings.autoCloseTime || ''}
            onChange={handleTimeChange('autoCloseTime')}
            disabled={!settings.autoClose}
            className={styles.timeInput}
            aria-label="자동 마감 시간"
          />
        </div>
      </div>
    </div>
  );
};

PosAutoSettings.propTypes = {
  settings: PropTypes.shape({
    autoOpen: PropTypes.bool.isRequired,
    autoOpenTime: PropTypes.string,
    autoClose: PropTypes.bool.isRequired,
    autoCloseTime: PropTypes.string,
  }).isRequired,
  onSettingsChange: PropTypes.func.isRequired,
};

export default PosAutoSettings; 
