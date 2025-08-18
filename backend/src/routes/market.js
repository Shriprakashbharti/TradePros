import express from 'express';
import Joi from 'joi';
import Instrument from '../models/Instrument.js';
import Candle from '../models/Candle.js';

const router = express.Router();

router.get('/instruments', async (req, res) => {
  const list = await Instrument.find({ active: true }).lean();
  res.json(list);
});

router.get('/candles', async (req, res) => {
  const schema = Joi.object({ symbol: Joi.string().uppercase().required(), limit: Joi.number().min(1).max(500).default(100) });
  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });
  const items = await Candle.find({ symbol: value.symbol }).sort({ ts: -1 }).limit(value.limit).lean();
  res.json(items.reverse());
});

export default router;


