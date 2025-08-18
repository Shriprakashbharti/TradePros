import Instrument from '../models/Instrument.js';
import Candle from '../models/Candle.js';
import Position from '../models/Position.js';
import { ws } from '../index.js';

const state = new Map(); // symbol -> { last, bid, ask, tickSize, ohlc, lastCandleTs }

function rw(last, tick) {
  const change = (Math.random() - 0.5) * 2 * tick;
  const next = Math.max(tick, last + change);
  return Math.round(next / tick) * tick;
}

export async function startMarket() {
  let instruments = await Instrument.find({ active: true }).lean();
  if (!instruments.length) {
    await Instrument.insertMany([
      { symbol: 'AAPL', name: 'Apple Inc', tickSize: 0.01, lotSize: 1, active: true },
      { symbol: 'BTCUSDT', name: 'Bitcoin Tether', tickSize: 0.1, lotSize: 0.001, active: true },
      { symbol: 'NIFTY', name: 'NIFTY Index', tickSize: 0.05, lotSize: 1, active: true }
    ]);
    instruments = await Instrument.find({ active: true }).lean();
  }
  for (const inst of instruments) {
    const base = 100 * (1 + Math.random());
    state.set(inst.symbol, { last: base, bid: base - inst.tickSize, ask: base + inst.tickSize, tickSize: inst.tickSize, ohlc: null, lastCandleTs: null });
  }
  const interval = parseInt(process.env.TICK_INTERVAL_MS || '1000', 10);
  setInterval(async () => {
    for (const inst of instruments) {
      const s = state.get(inst.symbol);
      const next = rw(s.last, inst.tickSize);
      const now = new Date();
      const minute = new Date(now); minute.setSeconds(0,0);
      if (!s.lastCandleTs || s.lastCandleTs.getTime() !== minute.getTime()) {
        if (s.ohlc) await Candle.updateOne({ symbol: inst.symbol, ts: s.lastCandleTs }, { symbol: inst.symbol, timeframe: '1m', ...s.ohlc, ts: s.lastCandleTs }, { upsert: true });
        s.ohlc = { o: next, h: next, l: next, c: next, v: 0 };
        s.lastCandleTs = minute;
      } else {
        s.ohlc.h = Math.max(s.ohlc.h, next);
        s.ohlc.l = Math.min(s.ohlc.l, next);
        s.ohlc.c = next; s.ohlc.v += Math.floor(1 + Math.random()*5);
      }
      s.last = next; s.bid = Math.max(inst.tickSize, next - inst.tickSize); s.ask = next + inst.tickSize;
      ws.to(`symbol:${inst.symbol}`).emit(`market:ticker:${inst.symbol}`, { symbol: inst.symbol, bid: s.bid, ask: s.ask, last: s.last, ts: new Date().toISOString() });
      const positions = await Position.find({ symbol: inst.symbol });
      for (const p of positions) { p.unrealizedPnL = (s.last - p.avgPrice) * p.qty; await p.save(); }
    }
  }, interval);

  ws.on('connection', (socket) => {
    socket.join(`user:${socket.user.sub}`);
    socket.on('market:subscribe', ({ symbol }) => socket.join(`symbol:${symbol}`));
    socket.on('market:unsubscribe', ({ symbol }) => socket.leave(`symbol:${symbol}`));
  });
}


