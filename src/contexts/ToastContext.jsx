import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import { playSound } from '../constants/sounds';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', playNotification = false) => {
    const id = Date.now();
    
    if (playNotification) {
      const soundType = type === 'error' ? 'ERROR' : 
                       type === 'success' ? 'STATUS_CHANGE' : 'NEW_ORDER';
      playSound(soundType);
    }

    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext; 
