import express from 'express';
import PortfolioService from '../services/PortfolioService.js';
import mongoose from 'mongoose';
import { authRequired } from '../util/auth.js';
import Position from '../models/Position.js';
const router = express.Router();

// Initialize portfolio service

router.get('/positions', authRequired, async (req, res) => {
  try {
    const list = await Position.find({ userId: req.user.sub }).lean();
    res.json(list);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

router.get('/summary', authRequired, async (req, res) => {
  try {
    const list = await Position.find({ userId: req.user.sub }).lean();
    const totalUnrealized = list.reduce((a, p) => a + (p.unrealizedPnL || 0), 0);
    const totalRealized = list.reduce((a, p) => a + (p.realizedPnL || 0), 0);
    res.json({ 
      totalUnrealized, 
      totalRealized, 
      positionsCount: list.length 
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

router.get('/', authRequired, async (req, res) => {
  try {
    const { range = '1M' } = req.query;
    const userId = req.user.sub; // Get from authenticated user

    // Validate range parameter
    if (!['1D', '1W', '1M', '3M', '1Y', 'ALL'].includes(range)) {
      return res.status(400).json({ 
        error: 'Invalid range parameter',
        details: 'Range must be one of: 1D, 1W, 1M, 3M, 1Y, ALL'
      });
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        details: 'The user ID must be a valid MongoDB ObjectId'
      });
    }

    const portfolioData = await PortfolioService.getPortfolioData(userId, range);
    res.json(portfolioData);
    
  } catch (error) {
    console.error('Error in portfolio route:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;