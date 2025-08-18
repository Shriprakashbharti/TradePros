import express from 'express';
import User from '../models/User.js';
import { authRequired, requireRole } from '../util/auth.js';

const router = express.Router();

router.get('/users', authRequired, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('name email role createdAt').lean();
  res.json(users);
});

router.get('/health', authRequired, requireRole('admin'), (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

export default router;


