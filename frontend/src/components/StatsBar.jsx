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
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Audit Logs</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-main)' }}>{notifications.length}</h2>
      </div>
    </div>
  );
}
