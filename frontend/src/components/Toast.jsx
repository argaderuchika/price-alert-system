import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onCloseToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>Alert Triggered</h4>
            <p style={{ fontSize: '0.8rem', marginTop: '2px', color: 'var(--text-main)' }}>{toast.message}</p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
              {new Date(toast.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => onCloseToast(toast.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
