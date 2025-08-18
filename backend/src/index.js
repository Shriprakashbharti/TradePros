import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// DB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trading';
await mongoose.connect(mongoUri);

// Models
import './models/User.js';
import './models/Instrument.js';
import './models/Order.js';
import './models/Trade.js';
import './models/Position.js';
import './models/Candle.js';
import './models/Transaction.js';

// Routes
import authRouter from './routes/auth.js';
import marketRouter from './routes/market.js';
import ordersRouter from './routes/orders.js';
import tradesRouter from './routes/trades.js';
import portfolioRouter from './routes/portfolio.js';
import adminRouter from './routes/admin.js';
import transactionRoutes from './routes/transactions.js';

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/admin', adminRouter);
app.use('/api/transactions', transactionRoutes)

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });
const nsp = io.of('/ws');
nsp.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    socket.user = payload;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

export const ws = nsp;

import { startMarket } from './services/market.js';

const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, () => {
  console.log(`Backend listening on :${port}`);
});

startMarket();


