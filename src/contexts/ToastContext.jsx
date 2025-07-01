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

  const addToast = useCallback((messageOrObject, type = 'info', sound = null) => {
    const id = Date.now();
    let message, toastType, toastSound;

    if (typeof messageOrObject === 'object') {
      message = messageOrObject.message;
      toastType = messageOrObject.type || type;
      toastSound = messageOrObject.sound;
    } else {
      message = messageOrObject;
      toastType = type;
      toastSound = sound;
    }
    
    if (toastSound) {
      playSound(toastSound);
    }

    setToasts(prev => [...prev, { id, message, type: toastType }]);
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
