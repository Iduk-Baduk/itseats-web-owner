import React from 'react';
import PropTypes from 'prop-types';
import styles from './PosAutoSettings.module.css';
import CheckBox from '../basic/CheckBox';

const PosAutoSettings = ({ settings, onSettingsChange }) => {
  const handleAutoOpenChange = (e) => {
    onSettingsChange({
      ...settings,
      autoOpen: e.target.checked,
    });
  };

  const handleAutoCloseChange = (e) => {
    onSettingsChange({
      ...settings,
      autoClose: e.target.checked,
    });
  };

  const handleTimeChange = (type, value) => {
    onSettingsChange({
      ...settings,
      [type]: value,
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>자동화 설정</h3>
      
      <div className={styles.settingRow}>
        <CheckBox
          checked={settings.autoOpen}
          onChange={handleAutoOpenChange}
          label="자동 오픈"
        />
        <input
          type="time"
          className={styles.timeInput}
          value={settings.autoOpenTime}
          onChange={(e) => handleTimeChange('autoOpenTime', e.target.value)}
          disabled={!settings.autoOpen}
        />
      </div>

      <div className={styles.settingRow}>
        <CheckBox
          checked={settings.autoClose}
          onChange={handleAutoCloseChange}
          label="자동 마감"
        />
        <input
          type="time"
          className={styles.timeInput}
          value={settings.autoCloseTime}
          onChange={(e) => handleTimeChange('autoCloseTime', e.target.value)}
          disabled={!settings.autoClose}
        />
      </div>
    </div>
  );
};

PosAutoSettings.propTypes = {
  settings: PropTypes.shape({
    autoOpen: PropTypes.bool.isRequired,
    autoOpenTime: PropTypes.string.isRequired,
    autoClose: PropTypes.bool.isRequired,
    autoCloseTime: PropTypes.string.isRequired,
  }).isRequired,
  onSettingsChange: PropTypes.func.isRequired,
};

export default PosAutoSettings; 
