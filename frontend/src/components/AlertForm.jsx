import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../apiConfig';

export default function AlertForm({ onAlertCreated, existingPrices }) {
  const [itemName, setItemName] = useState('BTC');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('ABOVE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  React.useEffect(() => {
    if (!targetPrice && existingPrices && existingPrices.length > 0) {
      const btc = existingPrices.find(p => p.itemName.toUpperCase() === 'BTC');
      if (btc && btc.currentPrice) {
        setTargetPrice(btc.currentPrice.toString());
      }
    }
  }, [existingPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (!itemName.trim()) {
      setErrorMsg('Please enter or select a symbol');
      return;
    }

    const numPrice = parseFloat(targetPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Target price must be a valid positive number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim().toUpperCase(),
          targetPrice: numPrice,
          condition,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create alert');
      }

      setTargetPrice('');
      if (data.notice) {
        setSuccessNotice(`${data.message} ${data.notice}`);
      } else {
        setSuccessNotice(`Alert created: ${data.alert.itemName} ${data.alert.condition} $${data.alert.targetPrice.toLocaleString()}`);
      }

      if (onAlertCreated) onAlertCreated(data.alert);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = (symbol) => {
    const uppercaseSymbol = symbol.toUpperCase();
    setItemName(uppercaseSymbol);
    const matched = existingPrices.find(p => p.itemName.toUpperCase() === uppercaseSymbol);
    if (matched && matched.currentPrice) {
      setTargetPrice(matched.currentPrice.toString());
    }
  };

  const handleQuickPriceSet = (multiplier) => {
    const matched = existingPrices.find(p => p.itemName.toUpperCase() === itemName.toUpperCase());
    if (matched && matched.currentPrice) {
      const computed = (matched.currentPrice * multiplier).toFixed(2);
      setTargetPrice(computed);
    }
  };

  const currentMatchedPrice = existingPrices.find(p => p.itemName.toUpperCase() === itemName.toUpperCase())?.currentPrice;

  return (
    <div className="panel" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Create Price Alert</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Set threshold triggers for market movements</p>
      </div>

      {errorMsg && (
        <div style={{
          padding: '10px 12px',
          background: '#fef2f2',
          border: '1px solid #fecdd3',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <AlertCircle size={15} flexShrink={0} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successNotice && (
        <div style={{
          padding: '10px 12px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '6px',
          color: '#047857',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px'
        }}>
          <CheckCircle size={15} flexShrink={0} />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Symbol / Item</label>
            {currentMatchedPrice && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                Current: ${currentMatchedPrice.toLocaleString()}
              </span>
            )}
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. BTC, ETH, AAPL"
            value={itemName}
            onChange={(e) => handleSelectSymbol(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {['BTC', 'ETH', 'AAPL', 'TSLA', 'NVDA'].map(ticker => (
              <button
                type="button"
                key={ticker}
                onClick={() => handleSelectSymbol(ticker)}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderColor: itemName === ticker ? 'var(--accent-primary)' : undefined,
                  background: itemName === ticker ? '#eff6ff' : undefined,
                  color: itemName === ticker ? '#1d4ed8' : undefined
                }}
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Condition</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setCondition('ABOVE')}
                style={{
                  background: condition === 'ABOVE' ? '#ffffff' : 'transparent',
                  color: condition === 'ABOVE' ? '#047857' : 'var(--text-muted)',
                  border: condition === 'ABOVE' ? '1px solid #a7f3d0' : 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: condition === 'ABOVE' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Above ▲
              </button>
              <button
                type="button"
                onClick={() => setCondition('BELOW')}
                style={{
                  background: condition === 'BELOW' ? '#ffffff' : 'transparent',
                  color: condition === 'BELOW' ? '#be123c' : 'var(--text-muted)',
                  border: condition === 'BELOW' ? '1px solid #fecdd3' : 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: condition === 'BELOW' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Below ▼
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Price ($)</label>
            <input
              type="number"
              step="any"
              className="form-input form-input-mono"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Target:</span>
          <button type="button" onClick={() => handleQuickPriceSet(1.05)} className="btn btn-secondary btn-sm">+5%</button>
          <button type="button" onClick={() => handleQuickPriceSet(1.10)} className="btn btn-secondary btn-sm">+10%</button>
          <button type="button" onClick={() => handleQuickPriceSet(0.95)} className="btn btn-secondary btn-sm">-5%</button>
          <button type="button" onClick={() => handleQuickPriceSet(0.90)} className="btn btn-secondary btn-sm">-10%</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-blue"
          style={{ marginTop: '6px', padding: '10px' }}
        >
          {loading ? 'Creating...' : 'Set Alert'}
        </button>
      </form>
    </div>
  );
}
