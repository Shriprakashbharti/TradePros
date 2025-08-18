import express from 'express';
import User from '../models/User.js';
import { authRequired, requireRole } from '../util/auth.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

router.get('/users', authRequired, requireRole('admin'), async (req, res) => {
  const users = await User.find().select('name email role createdAt').lean();
  res.json(users);
});

router.get('/health', authRequired, requireRole('admin'), (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Approve transaction endpoint
router.post('/:id/approve', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    if (transaction.type === 'deposit') {
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { balance: transaction.amount }
      })
    } else if (transaction.type === 'withdrawal') {
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { reservedBalance: -transaction.amount }
      })
    }

    transaction.status = 'completed'
    transaction.processedBy = req.user.id // assuming admin is logged in
    transaction.processedAt = new Date()
    await transaction.save()

    res.json({ message: 'Transaction approved' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})
;
export default router;


