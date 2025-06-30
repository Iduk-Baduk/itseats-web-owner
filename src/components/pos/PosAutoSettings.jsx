import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './PosAutoSettings.module.css';
import { validateAutoSettings } from '../../utils/posAutoScheduler';
import CheckBox from '../basic/CheckBox';
import TextInput from '../basic/TextInput';

const PosAutoSettings = ({ settings, onSettingsChange }) => {
  const [errors, setErrors] = useState([]);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    const validation = validateAutoSettings(newSettings);
    
    setErrors(validation.errors);
    if (validation.isValid) {
      onSettingsChange(newSettings);
    }
  };

  const handleTimeChange = (key, value) => {
    // 숫자와 콜론만 허용
    const sanitizedValue = value.replace(/[^0-9:]/g, '');
    handleSettingChange(key, sanitizedValue);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>자동화 설정</h3>
      
      {errors.length > 0 && (
        <div className={styles.errorContainer}>
          {errors.map((error, index) => (
            <p key={index} className={styles.errorMessage}>{error}</p>
          ))}
        </div>
      )}

      <div className={styles.settingGroup}>
        <div className={styles.settingRow}>
          <CheckBox
            id="autoOpen"
            label="자동 오픈"
            checked={localSettings.autoOpen}
            onChange={(checked) => handleSettingChange('autoOpen', checked)}
          />
          <TextInput
            value={localSettings.autoOpenTime || ''}
            onChange={(e) => handleTimeChange('autoOpenTime', e.target.value)}
            placeholder="HH:mm"
            disabled={!localSettings.autoOpen}
            maxLength={5}
            aria-label="자동 오픈 시간"
          />
        </div>
        
        <div className={styles.settingRow}>
          <CheckBox
            id="autoClose"
            label="자동 마감"
            checked={localSettings.autoClose}
            onChange={(checked) => handleSettingChange('autoClose', checked)}
          />
          <TextInput
            value={localSettings.autoCloseTime || ''}
            onChange={(e) => handleTimeChange('autoCloseTime', e.target.value)}
            placeholder="HH:mm"
            disabled={!localSettings.autoClose}
            maxLength={5}
            aria-label="자동 마감 시간"
          />
        </div>
      </div>

      <div className={styles.description}>
        <p>* 시간 형식: HH:mm (예: 09:00)</p>
        <p>* 자정을 넘어가는 영업시간 설정 가능 (예: 22:00 ~ 02:00)</p>
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
