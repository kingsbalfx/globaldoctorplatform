import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now() + Math.random();
    const error = { id, message, type, duration };
    setErrors(prev => [...prev, error]);

    if (duration > 0) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }

    return id;
  }, []);

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value = {
    errors,
    addError,
    removeError,
    clearAllErrors
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorToastContainer />
    </ErrorContext.Provider>
  );
};

const ErrorToastContainer = () => {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))] space-y-3">
      {errors.map((error) => (
        <ErrorToast key={error.id} error={error} onClose={() => removeError(error.id)} />
      ))}
    </div>
  );
};

const ErrorToast = ({ error, onClose }) => {
  const getIcon = () => {
    switch (error.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (error.type) {
      case 'success':
        return 'border-emerald-200 bg-white shadow-emerald-900/10';
      case 'warning':
        return 'border-amber-200 bg-white shadow-amber-900/10';
      case 'info':
        return 'border-blue-200 bg-white shadow-blue-900/10';
      default:
        return 'border-rose-200 bg-white shadow-rose-900/10';
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-2xl animate-in slide-in-from-right-2 ${getBgColor()}`}>
      <div className="h-1 bg-gradient-to-r from-brand-700 via-cyan-500 to-emerald-500" />
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 rounded-full bg-slate-50 p-2 ring-1 ring-slate-100">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {error.type === 'success' ? 'Completed' : error.type === 'warning' ? 'Attention' : error.type === 'info' ? 'Update' : 'Action needed'}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{error.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
