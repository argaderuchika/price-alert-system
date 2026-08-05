import React from 'react';
import { Trash2, Clock } from 'lucide-react';

export default function NotificationDrawer({ notifications, onClearHistory }) {
  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Trigger Audit History</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time audit log of triggered alerts</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearHistory}
            className="btn btn-secondary btn-sm"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.85rem' }}>No triggered alerts recorded yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
          {notifications.map((notif) => (
            <div
              key={notif._id || notif.createdAt}
              style={{
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-rose)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{notif.itemName} Triggered</strong>
                  <span className="badge badge-triggered" style={{ fontSize: '0.68rem' }}>
                    {notif.condition} ${notif.targetPrice.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '2px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Triggered at: <strong style={{ color: '#dc2626' }}>${notif.triggerPrice.toLocaleString()}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                <Clock size={11} />
                <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
