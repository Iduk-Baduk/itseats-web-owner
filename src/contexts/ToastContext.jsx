import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastContainer } from '../components/common/Toast';

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

  const addToast = useCallback((messageOrObject, type = 'info') => {
    const id = Date.now();
    let message, toastType;

    if (typeof messageOrObject === 'object') {
      message = messageOrObject.message;
      toastType = messageOrObject.type || type;
    } else {
      message = messageOrObject;
      toastType = type;
    }

    setToasts(prev => [...prev, { id, message, type: toastType }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast} 
      />
    </ToastContext.Provider>
  );
};

export default ToastContext; 
