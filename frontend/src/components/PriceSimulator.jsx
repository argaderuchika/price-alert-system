import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PriceSimulator({ prices, onPriceUpdated }) {
  const [selectedItem, setSelectedItem] = useState('BTC');
  const [customPrice, setCustomPrice] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const activePriceObj = prices.find(p => p.itemName.toUpperCase() === selectedItem.toUpperCase()) || {
    itemName: selectedItem,
    currentPrice: 50000,
  };

  const handleSimulate = async (priceToSet) => {
    const targetVal = parseFloat(priceToSet);
    if (isNaN(targetVal) || targetVal < 0) return;

    setSimulating(true);
    setLastResult(null);

    try {
      const res = await fetch('/api/prices/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: selectedItem.trim().toUpperCase(),
          newPrice: targetVal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLastResult(data);
        if (onPriceUpdated) onPriceUpdated(data);
      }
    } catch (err) {
      console.error('Price simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const applyDeltaPercentage = (percent) => {
    const current = activePriceObj.currentPrice || 100;
    const updated = Math.max(1, current * (1 + percent / 100));
    handleSimulate(updated.toFixed(2));
  };

  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Price Simulator</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Test alert logic by simulating live market ticks</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {prices.map((p) => {
          const isSelected = p.itemName.toUpperCase() === selectedItem.toUpperCase();
          const isUp = p.previousPrice ? p.currentPrice >= p.previousPrice : true;
          return (
            <div
              key={p.itemName}
              onClick={() => {
                setSelectedItem(p.itemName);
                setCustomPrice(p.currentPrice.toString());
              }}
              className={`price-card ${isSelected ? 'selected' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.itemName}</span>
                <span style={{ fontSize: '0.72rem', color: isUp ? '#047857' : '#dc2626' }}>
                  {isUp ? '▲' : '▼'}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, marginTop: '4px', color: 'var(--text-main)' }}>
                ${p.currentPrice.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Ticker</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {selectedItem}: ${activePriceObj.currentPrice ? activePriceObj.currentPrice.toLocaleString() : '---'}
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => applyDeltaPercentage(10)}
              className="btn btn-secondary btn-sm"
              disabled={simulating}
              style={{ color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
            >
              +10%
            </button>
            <button
              onClick={() => applyDeltaPercentage(-10)}
              className="btn btn-secondary btn-sm"
              disabled={simulating}
              style={{ color: '#be123c', borderColor: '#fecdd3', background: '#fff1f2' }}
            >
              -10%
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="number"
            className="form-input form-input-mono"
            placeholder={`New price for ${selectedItem}...`}
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
          />
          <button
            onClick={() => handleSimulate(customPrice || activePriceObj.currentPrice)}
            disabled={simulating || !customPrice}
            className="btn btn-primary btn-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            {simulating ? <RefreshCw size={14} className="spin" /> : 'Simulate Tick'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Evaluated {lastResult.evaluatedAlertsCount} alert(s). </span>
          {lastResult.triggeredAlertsCount > 0 ? (
            <span style={{ color: '#dc2626', fontWeight: 600 }}>{lastResult.triggeredAlertsCount} Alert(s) Triggered!</span>
          ) : (
            <span style={{ color: '#047857' }}>No thresholds crossed.</span>
          )}
        </div>
      )}
    </div>
  );
}
