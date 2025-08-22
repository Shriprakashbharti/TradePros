import express from "express";
import Joi from "joi";
import {authRequired} from "../util/auth.js";
import Instrument from "../models/Instrument.js";
import { submitOrder ,cancelOrderById } from "../services/matching.js";
import Trade from "../models/Trade.js";
import Position from "../models/Position.js";
import Order from "../models/Order.js";
const router = express.Router();

router.post("/", authRequired, async (req, res) => {

  try {
    const schema = Joi.object({
      symbol: Joi.string().uppercase().required(),
      side: Joi.string().valid("BUY", "SELL").required(),
      type: Joi.string().valid("MARKET", "LIMIT").required(),
      price: Joi.number().min(0).optional(),
      qty: Joi.number().min(1).required(),
      timeInForce: Joi.string().valid("GTC", "IOC", "FOK").default("GTC")

    });
    const { error, value } = schema.validate(req.body);
    console.log("body data",value.price)

    if (error) return res.status(400).json({ message: error.message });

    // ✅ Check instrument
    const inst = await Instrument.findOne({ symbol: value.symbol, active: true });
    if (!inst) return res.status(400).json({ message: "Unknown symbol" });

    // ✅ Price validation for LIMIT
    if (value.type === "LIMIT" && (value.price == null || value.price <= 0)) {
      return res.status(400).json({ message: "Price required for LIMIT" });
    }

    // ✅ Create Order - This already handles trade creation and position updates
    const order = await submitOrder({ userId: req.user.sub, ...value });

    return res.status(201).json({ order });
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/cancel', authRequired, async (req, res) => {
  const ok = await cancelOrderById(req.params.id, req.user.sub);
  if (!ok) return res.status(404).json({ message: 'Order not found or cannot cancel' });
  res.json({ success: true });
});

router.get('/', authRequired, async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid('OPEN', 'PARTIAL', 'FILLED', 'CANCELLED').optional(), symbol: Joi.string().uppercase().optional() });
  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).json({ message: error.message });
  const q = { user: req.user.sub };
  if (value.status) q.status = value.status;
  if (value.symbol) q.symbol = value.symbol;
  const list = await Order.find(q).sort({ createdAt: -1 }).lean();
  res.json(list);
});

export default router;


