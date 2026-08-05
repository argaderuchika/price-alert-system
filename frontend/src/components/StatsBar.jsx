import React from 'react';

export default function StatsBar({ alerts, prices, notifications, sseConnected }) {
  const activeAlerts = alerts.filter(a => a.status === 'PENDING').length;
  const triggeredAlerts = alerts.filter(a => a.status === 'TRIGGERED').length;
  const trackedItemsCount = prices.length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
      <div className="panel" style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Alerts</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{activeAlerts}</h2>
      </div>

      <div className="panel" style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Triggered Alerts</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: triggeredAlerts > 0 ? '#dc2626' : 'var(--text-main)' }}>{triggeredAlerts}</h2>
      </div>

      <div className="panel" style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tracked Symbols</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{trackedItemsCount}</h2>
      </div>

      <div className="panel" style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stream Status</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: sseConnected ? '#10b981' : '#ef4444',
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: sseConnected ? '#047857' : '#be123c' }}>
            {sseConnected ? 'Real-Time SSE' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
