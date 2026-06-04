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
    <div className="fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-3 px-4 sm:bottom-7">
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
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
    }
  };

  const getTone = () => {
    switch (error.type) {
      case 'success':
        return {
          shell: 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-white shadow-emerald-900/15',
          icon: 'bg-emerald-600 text-white shadow-emerald-700/25',
          bar: 'from-emerald-500 via-teal-400 to-cyan-400',
          title: 'Command completed',
        };
      case 'warning':
        return {
          shell: 'border-amber-200 bg-gradient-to-br from-white via-amber-50 to-white shadow-amber-900/15',
          icon: 'bg-amber-500 text-white shadow-amber-700/25',
          bar: 'from-amber-500 via-orange-400 to-rose-400',
          title: 'Review required',
        };
      case 'info':
        return {
          shell: 'border-blue-200 bg-gradient-to-br from-white via-blue-50 to-white shadow-blue-900/15',
          icon: 'bg-blue-600 text-white shadow-blue-700/25',
          bar: 'from-blue-600 via-cyan-500 to-teal-400',
          title: 'System update',
        };
      default:
        return {
          shell: 'border-rose-200 bg-gradient-to-br from-white via-rose-50 to-white shadow-rose-900/15',
          icon: 'bg-rose-600 text-white shadow-rose-700/25',
          bar: 'from-rose-600 via-red-500 to-amber-400',
          title: 'Action needed',
        };
    }
  };
  const tone = getTone();

  return (
    <div className={`w-[min(620px,100%)] overflow-hidden rounded-[1.35rem] border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 ${tone.shell}`}>
      <div className={`h-1.5 bg-gradient-to-r ${tone.bar}`} />
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg ${tone.icon}`}>
          {React.cloneElement(getIcon(), { className: 'h-5 w-5 text-white' })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            {tone.title}
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-900 sm:text-[15px]">{error.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/75 text-slate-400 ring-1 ring-slate-200 hover:bg-white hover:text-slate-700"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
