// src/lib/toastHelper.js
export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('gd-toast', { detail: { message: msg, type: 'success' } })),
  error: (msg) => window.dispatchEvent(new CustomEvent('gd-toast', { detail: { message: msg, type: 'error' } })),
  info: (msg) => window.dispatchEvent(new CustomEvent('gd-toast', { detail: { message: msg, type: 'info' } })),
};