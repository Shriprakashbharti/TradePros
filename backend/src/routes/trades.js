import express from 'express';
import Joi from 'joi';
import Trade from '../models/Trade.js';
import { authRequired } from '../util/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const schema = Joi.object({ symbol: Joi.string().uppercase().optional(), limit: Joi.number().min(1).max(500).default(100) });
  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });
  const q = { user: req.user.sub };
  if (value.symbol) q.symbol = value.symbol;
  const list = await Trade.find(q).sort({ createdAt: -1 }).limit(value.limit).lean();
  res.json(list);
});

export default router;


