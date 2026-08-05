# Price Alert System

A lightweight price monitoring service built with Node.js/Express, React, and MongoDB. Users can set custom price alerts (`ABOVE` / `BELOW` thresholds), simulate real-time price updates, and receive instant notifications.

## Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Runs on `http://localhost:5000`. Uses `mongodb-memory-server` by default, so no local database setup is required.*

### 2. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:3000` (or `http://localhost:5173`).*

---

## Technical Decisions & Assumptions

- **Server-Sent Events (SSE) over WebSockets**: Since alerts flow strictly server-to-client (unidirectional updates), SSE was chosen over WebSockets. It operates over standard HTTP without needing extra websocket connection libraries.
- **Alert State Machine**: Alerts move from `PENDING` to `TRIGGERED`. Once triggered, the engine ignores subsequent price ticks for that alert to prevent notification spamming. Users can re-arm an alert if needed.
- **Console & UI Notifications**: To satisfy the prompt requirement, triggered alerts log a formatted summary directly to the backend terminal (`console.log`), persist to MongoDB, and stream to the React UI.
- **In-Memory Mongo Fallback**: To keep evaluation zero-config, the backend uses `mongodb-memory-server` if no `MONGODB_URI` environment variable is present.

---

## Edge Cases Handled

1. **Duplicate Alerts**: Blocks creating active alerts with the exact same symbol, condition, and target price (returns `409 Conflict`).
2. **Price Boundary Validation**: `ABOVE` requires `price > target`, `BELOW` requires `price < target`. Equal prices do not trigger.
3. **Invalid Data Input**: Validates non-empty item names, positive numeric targets, and supported conditions (`ABOVE`/`BELOW`).

---

## API Summary

- `POST /api/alerts` — Create price alert
- `GET /api/alerts` — View alerts (supports `?status=PENDING` or `?itemName=BTC`)
- `DELETE /api/alerts/:id` — Delete alert
- `POST /api/alerts/:id/reset` — Reactivate triggered alert
- `POST /api/prices/simulate` — Simulate a price tick & evaluate active alerts
- `GET /api/notifications` — Notification history
- `GET /api/notifications/stream` — Live SSE event stream

---

## What I'd Build Next

1. **Authentication & User Scoping**: Link alerts to individual user accounts (JWT auth).
2. **Live Feed Integrations**: Connect real exchange WebSockets (e.g., Binance or CoinGecko) alongside the manual simulator.
3. **Delivery Webhooks/Email**: Add Nodemailer or Discord/Slack webhooks for off-site notifications.
