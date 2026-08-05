import React, { useState } from 'react';
import { Trash2, RotateCcw, Search } from 'lucide-react';

export default function ActiveAlerts({ alerts, onDeleteAlert, onResetAlert }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus;
    const matchesSearch = alert.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Alert Subscriptions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage active and triggered alerts</p>
        </div>

        <div style={{ display: 'flex', gap: '2px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {['ALL', 'PENDING', 'TRIGGERED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                background: filterStatus === st ? '#ffffff' : 'transparent',
                color: filterStatus === st ? 'var(--text-main)' : 'var(--text-muted)',
                borderRadius: '6px',
                border: filterStatus === st ? '1px solid #e2e8f0' : 'none',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: filterStatus === st ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Active' : 'Triggered'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
          placeholder="Filter by symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredAlerts.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.85rem' }}>No matching alerts found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredAlerts.map((alert) => {
            const isTriggered = alert.status === 'TRIGGERED';
            return (
              <div
                key={alert._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isTriggered ? '#fef2f2' : '#ffffff',
                  border: isTriggered ? '1px solid #fca5a5' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '6px',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {alert.itemName.slice(0, 3)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{alert.itemName}</span>
                      <span className={`badge ${alert.condition === 'ABOVE' ? 'badge-above' : 'badge-below'}`}>
                        {alert.condition}
                      </span>
                      <span className={`badge ${isTriggered ? 'badge-triggered' : 'badge-pending'}`}>
                        {isTriggered ? 'TRIGGERED' : 'ACTIVE'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      Target: ${alert.targetPrice.toLocaleString()}
                      {isTriggered && alert.triggeredPrice && (
                        <span style={{ marginLeft: '8px', color: '#dc2626' }}>
                          (Tripped: ${alert.triggeredPrice.toLocaleString()})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isTriggered && (
                    <button
                      onClick={() => onResetAlert(alert._id)}
                      title="Re-activate alert"
                      className="btn btn-secondary btn-sm"
                    >
                      <RotateCcw size={13} />
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteAlert(alert._id)}
                    title="Remove alert"
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
