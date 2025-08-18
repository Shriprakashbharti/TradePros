## Trading Platform (Dev/Demo)

Simple development-ready trading web app with live simulated ticks, order matching, portfolio, and risk alerts.

### Structure

```
trading-platform/
  backend/    # Node.js + Express + Socket.IO + MongoDB
  frontend/   # React 18 + Vite + Tailwind + Router + Recharts
  docs/       # Setup docs and API list
```

### Prerequisites

- Node.js 18+
- MongoDB running locally on mongodb://localhost:27017

### Backend Dev

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend: http://localhost:5000

### Frontend Dev

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173

### Notes

- WebSocket namespace: `/ws` (Socket.IO). Client connects to `${VITE_WS_BASE}/ws` with auth token.
- See `docs/README.md` for routes and events.


