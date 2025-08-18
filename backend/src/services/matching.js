import Order from '../models/Order.js';
import Trade from '../models/Trade.js';
import Position from '../models/Position.js';
import { ws } from '../index.js';

const books = new Map(); // symbol -> { buys: [], sells: [] }

function getBook(symbol) {
  if (!books.has(symbol)) books.set(symbol, { buys: [], sells: [] });
  return books.get(symbol);
}

function addToBook(order) {
  const book = getBook(order.symbol);
  if (order.side === 'BUY') {
    book.buys.push(order);
    book.buys.sort((a, b) => (b.price - a.price) || a.createdAt - b.createdAt);
  } else {
    book.sells.push(order);
    book.sells.sort((a, b) => (a.price - b.price) || a.createdAt - b.createdAt);
  }
}

function removeFromBook(symbol, id) {
  const book = getBook(symbol);
  book.buys = book.buys.filter((o) => o._id.toString() !== id.toString());
  book.sells = book.sells.filter((o) => o._id.toString() !== id.toString());
}

function obSnapshot(symbol, depth = 10) {
  const book = getBook(symbol);
  return {
    bids: book.buys.slice(0, depth).map((o) => ({ price: o.price || 0, qty: o.qty - o.filledQty, side: 'BUY' })),
    asks: book.sells.slice(0, depth).map((o) => ({ price: o.price || 0, qty: o.qty - o.filledQty, side: 'SELL' }))
  };
}

async function updatePosition(userId, symbol, side, price, qty) {
  const pos = await Position.findOne({ user: userId, symbol });
  const signed = side === 'BUY' ? qty : -qty;
  if (!pos) return Position.create({ user: userId, symbol, qty: signed, avgPrice: price, unrealizedPnL: 0, realizedPnL: 0 });
  const newQty = pos.qty + signed;
  if (pos.qty === 0 || Math.sign(pos.qty) === Math.sign(newQty)) {
    const totalCost = pos.avgPrice * Math.abs(pos.qty) + price * qty;
    const totalQty = Math.abs(pos.qty) + qty;
    pos.avgPrice = totalQty ? totalCost / totalQty : 0;
    pos.qty = newQty;
  } else {
    const closingQty = Math.min(Math.abs(pos.qty), qty);
    const pnl = (price - pos.avgPrice) * (pos.qty > 0 ? closingQty : -closingQty);
    pos.realizedPnL += pnl;
    pos.qty = newQty;
    if (pos.qty === 0) pos.avgPrice = 0;
  }
  await pos.save();
}

async function recordTrade(order, price, qty) {
  const trade = await Trade.create({ order: order._id, user: order.user, symbol: order.symbol, price, qty, side: order.side });
  ws.to(`user:${order.user.toString()}`).emit('trades:updated', trade.toObject());
  await updatePosition(order.user, order.symbol, order.side, price, qty);
}

async function fill(order, price, qty) {
  order.filledQty += qty;
  order.status = order.filledQty >= order.qty ? 'FILLED' : 'PARTIAL';
  await order.save();
  await recordTrade(order, price, qty);
}

export async function submitOrder({ userId, symbol, side, type, price, qty }) {
  const order = await Order.create({ user: userId, symbol, side, type, price, qty, status: 'OPEN', filledQty: 0 });
  if (type === 'MARKET') {
    await match(order, true);
  } else {
    addToBook(order);
    await match(order, false);
  }
  ws.to(`user:${userId}`).emit('orders:updated', { orderId: order._id });
  ws.to(`symbol:${symbol}`).emit(`market:orderbook:${symbol}`, obSnapshot(symbol));
  return order.toObject();
}

export async function cancelOrderById(id, userId) {
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order || order.status === 'FILLED' || order.status === 'CANCELLED') return false;
  order.status = 'CANCELLED';
  await order.save();
  removeFromBook(order.symbol, order._id);
  ws.to(`user:${userId}`).emit('orders:updated', { orderId: id });
  ws.to(`symbol:${order.symbol}`).emit(`market:orderbook:${order.symbol}`, obSnapshot(order.symbol));
  return true;
}

async function match(order, isMarket) {
  const book = getBook(order.symbol);
  const contraList = order.side === 'BUY' ? book.sells : book.buys;
  let remaining = order.qty - order.filledQty;
  for (let i = 0; i < contraList.length && remaining > 0; i++) {
    const contra = contraList[i];
    const priceOk = isMarket || (order.side === 'BUY' ? order.price >= contra.price : order.price <= contra.price);
    if (!priceOk) break;
    const avail = contra.qty - contra.filledQty;
    const tQty = Math.min(remaining, avail);
    const tPrice = contra.price || order.price || 0;
    await fill(order, tPrice, tQty);
    contra.filledQty += tQty;
    contra.status = contra.filledQty >= contra.qty ? 'FILLED' : 'PARTIAL';
    await contra.save();
    remaining = order.qty - order.filledQty;
    if (contra.status === 'FILLED') { removeFromBook(order.symbol, contra._id); i--; }
  }
  if (!isMarket && order.status !== 'FILLED') {
    const sideList = order.side === 'BUY' ? book.buys : book.sells;
    if (!sideList.find((o) => o._id.toString() === order._id.toString())) addToBook(order);
  } else if (isMarket && order.status !== 'FILLED') {
    order.status = order.filledQty > 0 ? 'PARTIAL' : 'CANCELLED';
    await order.save();
  }
}

export function orderbookSnapshot(symbol) { return obSnapshot(symbol); }


