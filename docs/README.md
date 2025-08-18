## Dev/Demo Setup

### Prereqs
- Node.js 18+
- Local MongoDB at mongodb://localhost:27017

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```
Endpoints:
- Auth: /api/auth/register, /login, /refresh, /logout, /me
- Market: /api/market/instruments, /candles?symbol=AAPL
- Orders: POST /api/orders, POST /api/orders/:id/cancel, GET /api/orders
- Trades: GET /api/trades
- Portfolio: GET /api/portfolio/positions, /summary
- Admin: GET /api/admin/users, /health

### WebSocket
Namespace: `/ws`
Server emits:
- `market:ticker:{symbol}` { symbol, bid, ask, last, ts }
- `market:orderbook:{symbol}` { bids, asks }
- `orders:updated` { orderId }
- `trades:updated` Trade

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```


