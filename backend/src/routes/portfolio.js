import express from 'express';
import Position from '../models/Position.js';
import { authRequired } from '../util/auth.js';

const router = express.Router();

router.get('/positions', authRequired, async (req, res) => {
  const list = await Position.find({ user: req.user.sub }).lean();
  res.json(list);
});

router.get('/summary', authRequired, async (req, res) => {
  const list = await Position.find({ user: req.user.sub }).lean();
  const totalUnrealized = list.reduce((a, p) => a + (p.unrealizedPnL || 0), 0);
  const totalRealized = list.reduce((a, p) => a + (p.realizedPnL || 0), 0);
  res.json({ totalUnrealized, totalRealized, positionsCount: list.length });
});

export default router;


