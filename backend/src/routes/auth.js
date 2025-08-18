import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';

const router = express.Router();

function tokens(user) {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'dev_secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'dev_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

router.post('/register', async (req, res) => {
  const schema = Joi.object({ name: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(6).required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(value.password, 10);
  const user = await User.create({ name: value.name, email: value.email, passwordHash });
  const t = tokens(user);
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, ...t });
});

router.post('/login', async (req, res) => {
  const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(value.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const t = tokens(user);
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, ...t });
});

router.post('/refresh', async (req, res) => {
  const schema = Joi.object({ refreshToken: Joi.string().required() });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const payload = jwt.verify(value.refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_secret');
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const t = tokens(user);
    res.json(t);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => res.json({ success: true }));

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;


