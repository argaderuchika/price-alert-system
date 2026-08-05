import React, { useState, useEffect } from 'react';
import StatsBar from './components/StatsBar';
import AlertForm from './components/AlertForm';
import PriceSimulator from './components/PriceSimulator';
import ActiveAlerts from './components/ActiveAlerts';
import NotificationDrawer from './components/NotificationDrawer';
import Toast from './components/Toast';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [alertsRes, pricesRes, notifRes] = await Promise.all([
        fetch('/api/alerts'),
        fetch('/api/prices'),
        fetch('/api/notifications'),
      ]);

      const alertsData = await alertsRes.json();
      const pricesData = await pricesRes.json();
      const notifData = await notifRes.json();

      if (alertsData.success) setAlerts(alertsData.alerts);
      if (pricesData.success) setPrices(pricesData.prices);
      if (notifData.success) setNotifications(notifData.notifications);
    } catch (err) {
      console.error('Failed fetching app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ALERT_TRIGGERED') {
          setAlerts(prev => prev.map(a => a._id === data.alert._id ? data.alert : a));
          setNotifications(prev => [data.notification, ...prev]);

          const newToast = {
            id: Date.now() + Math.random(),
            message: data.notification.message,
            timestamp: new Date(),
          };
          setToasts(prev => [newToast, ...prev]);

          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
          }, 6000);
        }

        if (data.type === 'PRICE_UPDATED') {
          setPrices(prev => {
            const exists = prev.find(p => p.itemName === data.price.itemName);
            if (exists) {
              return prev.map(p => p.itemName === data.price.itemName ? data.price : p);
            }
            return [data.price, ...prev];
          });
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleAlertCreated = (newAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const handleResetAlert = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}/reset`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAlerts(prev => prev.map(a => a._id === id ? data.alert : a));
      }
    } catch (err) {
      console.error('Failed to reset alert:', err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      <Toast toasts={toasts} onCloseToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            R
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Real-Time Price Alert System
            </h1>
            {/* <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Price Sentinel
            </h1> */}
            {/* <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-Time Price Alert Engine
            </p> */}
          </div>
        </div>

        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: 'var(--text-muted)'
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: sseConnected ? 'var(--accent-emerald)' : 'var(--accent-rose)'
            }} />
            {sseConnected ? 'Connected' : 'Offline'}
          </div>


        </div> */}
      </header>

      <StatsBar alerts={alerts} prices={prices} notifications={notifications} sseConnected={sseConnected} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <AlertForm onAlertCreated={handleAlertCreated} existingPrices={prices} />
        <PriceSimulator prices={prices} onPriceUpdated={() => fetchData()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <ActiveAlerts alerts={alerts} onDeleteAlert={handleDeleteAlert} onResetAlert={handleResetAlert} />
        <NotificationDrawer notifications={notifications} onClearHistory={handleClearNotifications} />
      </div>
    </div>
  );
}
