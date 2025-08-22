import Order from '../models/Order.js';
import Trade from '../models/Trade.js';
import Position from '../models/Position.js';
import { ws } from '../index.js';
import User from '../models/User.js';
import Instrument from "../models/Instrument.js";

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

/** --- FILL HELPERS --- **/

async function creditOrRefundAfterBuyFill(user, order) {
  // Refund leftover hold for THIS order only
  if (order.reservedAmount > 0) {
    const refund = Math.max(0, order.reservedAmount);
    user.balance += refund;
    // Don't let reservedBalance go negative if concurrent updates happen
    const release = Math.min(refund, Math.max(0, user.reservedBalance));
    user.reservedBalance -= release;
    order.reservedAmount = 0;
    await order.save();
  }
  await user.save();
}

async function applyBuyFillAdjustments(user, order, execPrice, execQty) {
  const spent = execPrice * execQty;

  // Reduce global reserved by the spent part of THIS order
  const releaseSpent = Math.min(spent, Math.max(0, user.reservedBalance));
  user.reservedBalance -= releaseSpent;

  // Reduce per-order hold
  order.reservedAmount = Math.max(0, (order.reservedAmount || 0) - spent);

  await user.save();
  await order.save();
}

async function updatePositionAfterFill(userId, symbol, side, execPrice, execQty) {
  let pos = await Position.findOne({ user: userId, symbol });
  const inst = await Instrument.findOne({ symbol });

  if (side === 'BUY') {
    if (!pos) {
      pos = await Position.create({
        user: userId,
        symbol,
        qty: execQty,
        avgPrice: execPrice,
        unrealizedPnL: 0,
        realizedPnL: 0,
      });
    } else {
      const totalQty = pos.qty + execQty;
      pos.avgPrice = (pos.avgPrice * pos.qty + execPrice * execQty) / totalQty;
      pos.qty = totalQty;
    }
    // update unrealized PnL
    if (inst?.lastPrice) {
      pos.unrealizedPnL = (inst.lastPrice - pos.avgPrice) * pos.qty;
    }
    await pos.save();
  } else { // SELL
    if (pos) {
      // Unlock the shares that were reserved
      pos.reservedQty = Math.max(0, pos.reservedQty - execQty);
  
      // Reduce actual qty now
      pos.qty -= execQty;
  
      const pnl = (execPrice - pos.avgPrice) * execQty;
      pos.realizedPnL += pnl;
  
      if (pos.qty === 0) {
        pos.avgPrice = 0;
        pos.unrealizedPnL = 0;
      } else if (inst?.lastPrice) {
        pos.unrealizedPnL = (inst.lastPrice - pos.avgPrice) * pos.qty;
      }
      await pos.save();
    }
  }
}

async function fill(order, price, qty) {
  // 1) Update order fill
  order.filledQty += qty;
  order.status = order.filledQty >= order.qty ? 'FILLED' : 'PARTIAL';
  await order.save();

  // 2) Balances / positions
  const user = await User.findById(order.user);
  if (!user) throw new Error('User not found');

  if (order.side === 'BUY') {
    // Apply spent part to reserved and per-order hold
    await applyBuyFillAdjustments(user, order, price, qty);

    // If fully filled now, refund leftover of THIS order's hold
    if (order.status === 'FILLED') {
      await creditOrRefundAfterBuyFill(user, order);
    }
  } else {
    // SELL → credit proceeds now
    const proceeds = price * qty;
    user.balance += proceeds;
    await user.save();
    
    console.log('SELLER CREDITED:', {
      userId: order.user.toString(),
      symbol: order.symbol,
      price: price,
      qty: qty,
      proceeds: proceeds,
      newBalance: user.balance
    });
  }

  // 3) Update position (final ownership)
  await updatePositionAfterFill(order.user, order.symbol, order.side, price, qty);

  // 4) Record trade
  const trade = await Trade.create({
    order: order._id,
    user: order.user,
    symbol: order.symbol,
    price,
    qty,
    side: order.side,
  });

  // 5) Update last price for MARKET reference
  await Instrument.updateOne({ symbol: order.symbol }, { $set: { lastPrice: price } });

  // 6) Notify the user whose order was filled
  ws.to(`user:${order.user.toString()}`).emit('trades:updated', trade.toObject());
  
  // 7) Also notify for order update
  ws.to(`user:${order.user.toString()}`).emit('orders:updated', {
    orderId: order._id,
    status: order.status,
    filledQty: order.filledQty,
    price: order.price,
    symbol: order.symbol,
    side: order.side
  });

  console.log('FILL COMPLETED:', {
    orderId: order._id.toString(),
    side: order.side,
    price: price,
    qty: qty,
    status: order.status
  });
}
/** --- PUBLIC API --- **/

export async function submitOrder({ userId, symbol, side, type, price, qty }) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Resolve price for MARKET
  if (type === "MARKET") {
    const inst = await Instrument.findOne({ symbol });
    if (!inst) throw new Error("Instrument not found");
    price = inst.lastPrice; // must be present; update on each trade in fill()
  }

  price = Number(price);
  qty = Number(qty);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Invalid price");
  if (!Number.isFinite(qty)   || qty <= 0)   throw new Error("Invalid quantity");

  const requiredAmount = price * qty;

  if (side === "BUY") {
    if (user.balance < requiredAmount) throw new Error("Insufficient balance");
    // Move funds from balance → global reserved; also record per-order hold
    user.balance -= requiredAmount;
    user.reservedBalance += requiredAmount;
    await user.save();
  } else {
    // SELL: lock shares in reservedQty
    const pos = await Position.findOne({ user: userId, symbol });
    if (!pos || pos.qty - pos.reservedQty < qty) throw new Error("Insufficient available shares to sell");
  
    pos.reservedQty += qty;
    await pos.save();
  }
  

  // Create order (include per-order hold for BUY)
  let order = await Order.create({
    user: userId,
    symbol,
    side,
    type,
    price,
    qty,
    status: "OPEN",
    filledQty: 0,
    reservedAmount: side === 'BUY' ? requiredAmount : 0,
  });

  user.orders.push(order._id);
  await user.save();

  // DEBUG: Log order creation
  console.log('ORDER CREATED:', {
    orderId: order._id.toString(),
    userId: userId,
    symbol: symbol,
    side: side,
    type: type,
    price: price,
    qty: qty
  });

  // Try to match
  if (type === "MARKET") {
    order = await match(order, true);
  } else {
    order = await match(order, false);
    if (order.status === "OPEN" || order.status === "PARTIAL") {
      addToBook(order);
    }
  }

  // Finalize status consistency
  if (order.filledQty === 0) order.status = "OPEN";
  else if (order.filledQty < order.qty) order.status = "PARTIAL";
  else order.status = "FILLED";
  await order.save();

  // DEBUG: Log final order status
  console.log('ORDER FINAL STATUS:', {
    orderId: order._id.toString(),
    status: order.status,
    filledQty: order.filledQty,
    price: order.price
  });

  // Emit updates
  ws.to(`user:${userId}`).emit("orders:updated", {
    orderId: order._id,
    status: order.status,
    filledQty: order.filledQty,
    price: order.price, // Include price in the update
    symbol: order.symbol,
    side: order.side
  });
  
  ws.to(`symbol:${symbol}`).emit(`market:orderbook:${symbol}`, obSnapshot(symbol));

  return order.toObject();
}

export async function cancelOrderById(id, userId) {
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order || order.status === 'FILLED' || order.status === 'CANCELLED') return false;

  order.status = 'CANCELLED';
  await order.save();

  
  // Refund any leftover per-order reservation for BUY
  if (order.side === 'BUY' && order.reservedAmount > 0) {
    const user = await User.findById(userId);
    if (user) {
      user.balance += order.reservedAmount;
      const release = Math.min(order.reservedAmount, Math.max(0, user.reservedBalance));
      user.reservedBalance -= release;
      await user.save();
    }
    order.reservedAmount = 0;
    await order.save();
  }else if (order.side === 'SELL') {
    const pos = await Position.findOne({ user: userId, symbol: order.symbol });
    if (pos) {
      pos.reservedQty = Math.max(0, pos.reservedQty - (order.qty - order.filledQty));
      await pos.save();
    }
  }

  removeFromBook(order.symbol, order._id);
  ws.to(`user:${userId}`).emit('orders:updated', { orderId: id, status: 'CANCELLED' });
  ws.to(`symbol:${order.symbol}`).emit(`market:orderbook:${order.symbol}`, obSnapshot(order.symbol));
  return true;
}

async function match(order, isMarket) {
  try {
    console.log('MATCHING START:', {
      orderId: order._id.toString(),
      side: order.side,
      type: order.type,
      price: order.price,
      qty: order.qty,
      isMarket: isMarket
    });

    const book = getBook(order.symbol);
    const contraList = order.side === 'BUY' ? book.sells : book.buys;
    let remaining = order.qty - order.filledQty;

    console.log('CONTRALIST LENGTH:', contraList.length);
    console.log('CONTRALIST:', contraList.map(o => ({
      id: o._id.toString(),
      side: o.side,
      price: o.price,
      qty: o.qty,
      filled: o.filledQty
    })));
    
    for (let i = 0; i < contraList.length && remaining > 0; i++) {
      const contra = contraList[i];
      
      console.log('CHECKING CONTRA:', {
        contraId: contra._id.toString(),
        contraSide: contra.side,
        contraPrice: contra.price,
        contraQty: contra.qty,
        contraFilled: contra.filledQty
      });

      const priceOk = isMarket || (order.side === 'BUY' ? order.price >= contra.price : order.price <= contra.price);
      
      console.log('PRICE OK:', priceOk, 'Order price:', order.price, 'Contra price:', contra.price);
      
      if (!priceOk) {
        console.log('PRICE NOT OK - BREAKING');
        break;
      }

      const avail = contra.qty - contra.filledQty;
      const tQty = Math.min(remaining, avail);
      
      // FIX: Use the contra order's price for the execution (not the incoming order's price)
      const tPrice = contra.price; // This is the key fix - use the contra order's price
      
      console.log('EXECUTING TRADE:', {
        tPrice: tPrice,
        tQty: tQty,
        orderSide: order.side,
        contraSide: contra.side
      });

      // Fill BOTH orders (the incoming order and the contra order)
      await fill(order, tPrice, tQty);
      await fill(contra, tPrice, tQty); // This is the missing part!

      contra.filledQty += tQty;
      contra.status = contra.filledQty >= contra.qty ? 'FILLED' : 'PARTIAL';
      await contra.save();

      remaining = order.qty - order.filledQty;

      if (contra.status === 'FILLED') {
        console.log('REMOVING FILLED CONTRA ORDER:', contra._id.toString());
        removeFromBook(order.symbol, contra._id);
        i--;
      }
    }

    if (!isMarket && order.status !== 'FILLED') {
      const sideList = order.side === 'BUY' ? book.buys : book.sells;
      if (!sideList.find((o) => o._id.toString() === order._id.toString())) {
        console.log('ADDING ORDER TO BOOK:', order._id.toString());
        addToBook(order);
      }
    } else if (isMarket && order.status !== 'FILLED') {
      order.status = order.filledQty > 0 ? 'PARTIAL' : 'CANCELLED';
      await order.save();
      console.log('MARKET ORDER FINAL STATUS:', order.status);
    }

    console.log('MATCHING COMPLETE:', {
      orderId: order._id.toString(),
      finalStatus: order.status,
      filledQty: order.filledQty
    });

    return order;
  } catch (error) {
    console.error('Error in match function:', error);
    throw error;
  }
}

export function orderbookSnapshot(symbol) {
  return obSnapshot(symbol);
}
