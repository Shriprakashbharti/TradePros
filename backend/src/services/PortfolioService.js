import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Position from '../models/Position.js';
import Candle from '../models/Candle.js';
import mongoose from 'mongoose';
import Trade from '../models/Trade.js'; 

const ObjectId = mongoose.Types.ObjectId;

class PortfolioService {

    async getPortfolioData(userId, range = '1M') {
      if (!ObjectId.isValid(userId)) throw new Error('Invalid user ID format');
      const user = await User.findById(userId).select('balance').lean();
      if (!user) throw new Error('User not found');
  
      const dateRange = this.calculateDateRange(range);
  
      // ✅ separate tx & trades
      const transactions = await Transaction.find({
        userId: new ObjectId(userId),
        createdAt: { $gte: dateRange },
        status: 'completed'
      }).sort({ createdAt: -1 }).limit(5).lean();
  
      const trades = await Trade.find({
        user: new ObjectId(userId),
        createdAt: { $gte: dateRange }
      }).sort({ createdAt: -1 }).limit(5).lean();
  
      const holdings = await this.calculateHoldings(userId);
      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0) + (user.balance || 0);
      const todayChange = await this.calculateDailyChange(userId, holdings);
  
      return {
        totalValue,
        todayChange,
        unrealizedPL: holdings.reduce((sum, h) => sum + h.unrealizedPL, 0),
        holdings,
        recentActivity: [
          ...transactions.map(t => ({
            description: t.type,
            amount: t.amount,
            timestamp: t.createdAt
          })),
          ...trades.map(tr => ({
            description: tr.side === 'BUY' ? `Bought ${tr.symbol}` : `Sold ${tr.symbol}`,
            amount: tr.qty * tr.price,
            timestamp: tr.createdAt
          }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5),
        cashBalance: user.balance || 0
      };
    }
  

  calculateDateRange(range) {
    const now = new Date();
    switch (range) {
      case '1D': return new Date(now.setDate(now.getDate() - 1));
      case '1W': return new Date(now.setDate(now.getDate() - 7));
      case '1M': return new Date(now.setMonth(now.getMonth() - 1));
      case '3M': return new Date(now.setMonth(now.getMonth() - 3));
      case '1Y': return new Date(now.setFullYear(now.getFullYear() - 1));
      case 'ALL': return new Date(0);
      default: return new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  async calculateHoldings(userId) {
    try {
      // Get all positions for the user
      const positions = await Position.find({ user: new ObjectId(userId) }).lean();

      // Get current prices for all positions
      const holdings = await Promise.all(positions.map(async (position) => {
        // Get the latest candle for price data
        const latestCandle = await Candle.findOne({ symbol: position.symbol })
          .sort({ ts: -1 })
          .lean();

        if (!latestCandle) {
          console.warn(`No price data found for ${position.symbol}`);
          return null;
        }

        const currentPrice = latestCandle.c;
        const currentValue = position.qty * currentPrice;
        const unrealizedPL = currentValue - (position.avgPrice * position.qty);
        const unrealizedPLPercent = (position.avgPrice > 0) ? 
          (unrealizedPL / (position.avgPrice * position.qty)) * 100 : 0;

        return {
          symbol: position.symbol,
          quantity: position.qty,
          avgPrice: position.avgPrice,
          currentPrice,
          costBasis: position.avgPrice * position.qty,
          currentValue,
          unrealizedPL,
          unrealizedPLPercent,
          positionId: position._id
        };
      }));

      // Filter out any null holdings (symbols without price data)
      return holdings.filter(h => h !== null);
    } catch (error) {
      console.error('Error calculating holdings:', error);
      throw new Error('Failed to calculate holdings');
    }
  }

  async calculateDailyChange(userId, holdings) {
    try {
      if (!holdings || holdings.length === 0) {
        return { amount: 0, percentage: 0 };
      }

      // Get yesterday's closing prices for all holdings
      const yesterdayPrices = await Promise.all(
        holdings.map(async (holding) => {
          // Get candle from 24 hours ago
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const candle = await Candle.findOne({
            symbol: holding.symbol,
            ts: { $lte: yesterday }
          })
          .sort({ ts: -1 })
          .lean();

          return {
            symbol: holding.symbol,
            yesterdayPrice: candle ? candle.c : holding.currentPrice
          };
        })
      );

      // Calculate today's change
      let totalChangeAmount = 0;
      let totalYesterdayValue = 0;

      for (const holding of holdings) {
        const yesterdayData = yesterdayPrices.find(p => p.symbol === holding.symbol);
        if (yesterdayData) {
          const yesterdayValue = holding.quantity * yesterdayData.yesterdayPrice;
          const todayValue = holding.currentValue;
          totalChangeAmount += (todayValue - yesterdayValue);
          totalYesterdayValue += yesterdayValue;
        }
      }

      const percentageChange = totalYesterdayValue > 0 ? 
        (totalChangeAmount / totalYesterdayValue) * 100 : 0;

      return {
        amount: totalChangeAmount,
        percentage: percentageChange
      };
    } catch (error) {
      console.error('Error calculating daily change:', error);
      return {
        amount: 0,
        percentage: 0
      };
    }
  }

  async getPortfolioHistory(userId, range = '1M') {
    try {
      const dateRange = this.calculateDateRange(range);
      
      // Get all transactions over time
      const transactions = await Transaction.find({
        userId: new ObjectId(userId),
        createdAt: { $gte: dateRange },
        status: 'completed'
      })
      .sort({ createdAt: 1 })
      .lean();

      // Group by day and calculate portfolio value
      const portfolioHistory = [];
      let currentHoldings = new Map();
      let currentCash = 0;
      
      // Get initial cash balance
      const user = await User.findById(userId).select('balance').lean();
      if (user) currentCash = user.balance || 0;

      // Process transactions chronologically
      for (const tx of transactions) {
        const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
        
        if (!portfolioHistory.some(entry => entry.date === txDate)) {
          // Calculate portfolio value for this day
          const dayValue = await this.calculateDayValue(currentHoldings, txDate, currentCash);
          portfolioHistory.push({ date: txDate, value: dayValue });
        }

        // Update holdings based on transaction
        if (tx.type === 'trade' && tx.side === 'BUY') {
          currentCash -= tx.amount || (tx.quantity * tx.price);
          const existing = currentHoldings.get(tx.symbol) || { qty: 0, cost: 0 };
          currentHoldings.set(tx.symbol, {
            qty: existing.qty + (tx.quantity || 0),
            cost: existing.cost + (tx.amount || (tx.quantity * tx.price))
          });
        } else if (tx.type === 'trade' && tx.side === 'SELL') {
          currentCash += tx.amount || (tx.quantity * tx.price);
          const existing = currentHoldings.get(tx.symbol);
          if (existing) {
            const remainingQty = existing.qty - (tx.quantity || 0);
            if (remainingQty <= 0) {
              currentHoldings.delete(tx.symbol);
            } else {
              currentHoldings.set(tx.symbol, {
                qty: remainingQty,
                cost: existing.cost * (remainingQty / existing.qty)
              });
            }
          }
        } else if (tx.type === 'deposit') {
          currentCash += tx.amount;
        } else if (tx.type === 'withdrawal') {
          currentCash -= tx.amount;
        }
      }

      return portfolioHistory;
    } catch (error) {
      console.error('Error getting portfolio history:', error);
      throw error;
    }
  }

  async calculateDayValue(holdings, date, cashBalance) {
    try {
      let totalValue = cashBalance;
      
      for (const [symbol, holding] of holdings) {
        // Get closing price for this symbol on this date
        const candle = await Candle.findOne({
          symbol,
          ts: { $lte: new Date(`${date}T23:59:59.999Z`) }
        })
        .sort({ ts: -1 })
        .lean();

        if (candle) {
          totalValue += holding.qty * candle.c;
        }
      }

      return totalValue;
    } catch (error) {
      console.error('Error calculating day value:', error);
      return cashBalance;
    }
  }
}

export default new PortfolioService();