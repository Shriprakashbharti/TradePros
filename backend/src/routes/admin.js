import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import { authRequired, requireRole } from '../util/auth.js';

const router = express.Router();

// Get all users with pagination and search
router.get('/users', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('name email role balance reservedBalance createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details with transactions and orders
router.get('/users/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate({
        path: 'transactions',
        options: { sort: { createdAt: -1 }, limit: 10 }
      })
      .populate({
        path: 'orders',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information
router.put('/users/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { balance, role, reservedBalance } = req.body;
    
    const updateData = {};
    if (balance !== undefined) updateData.balance = balance;
    if (reservedBalance !== undefined) updateData.reservedBalance = reservedBalance;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all financial transactions (deposits/withdrawals)
router.get('/transactions', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.userId = userId;

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trading orders
router.get('/orders', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, side, symbol, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (side) query.side = side;
    if (symbol) query.symbol = symbol;
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve deposit transaction
router.post('/transactions/:id/approve-deposit', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type !== 'deposit') {
      return res.status(400).json({ message: 'Only deposit transactions can be approved' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    // Update user balance
    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { balance: transaction.amount }
    });

    transaction.status = 'completed';
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ message: 'Deposit approved successfully', transaction });
  } catch (error) {
    console.error('Error approving deposit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve withdrawal transaction
router.post('/transactions/:id/approve-withdrawal', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type !== 'withdrawal') {
      return res.status(400).json({ message: 'Only withdrawal transactions can be approved' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    // Release reserved balance
    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { reservedBalance: -transaction.amount }
    });

    transaction.status = 'completed';
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ message: 'Withdrawal approved successfully', transaction });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users/:id/balance', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { balance: amount } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: req.params.id,
      type: 'deposit',
      amount: amount,
      method: 'admin_adjustment',
      status: 'completed',
      processedBy: req.user.id,
      processedAt: new Date(),
      adminNotes: `Balance adjustment by admin`
    });
    await transaction.save();

    res.json({ message: 'Balance added successfully', user });
  } catch (error) {
    console.error('Error adding balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate temporary password or send reset email
    // This is a placeholder - implement your actual password reset logic
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // In production, you would:
    // 1. Hash the temporary password
    // 2. Send email with reset link or temporary password
    // 3. Set passwordResetRequired flag
    
    res.json({ 
      message: 'Password reset initiated', 
      // Remove this in production - only for demo
      tempPassword: tempPassword 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Reject transaction
router.post('/transactions/:id/reject', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    // If it's a withdrawal, release the reserved balance
    if (transaction.type === 'withdrawal') {
      await User.findByIdAndUpdate(transaction.userId, {
        $inc: { reservedBalance: -transaction.amount }
      });
    }

    transaction.status = 'rejected';
    transaction.processedBy = req.user.id;
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({ message: 'Transaction rejected successfully', transaction });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel user order
router.post('/orders/:id/cancel', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'OPEN' && order.status !== 'PARTIAL') {
      return res.status(400).json({ message: 'Only open or partial orders can be cancelled' });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get system health and statistics
router.get('/health', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const stats = {
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      users: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      pendingTransactions: await Transaction.countDocuments({ 
        type: { $in: ['deposit', 'withdrawal'] },
        status: 'pending' 
      }),
      totalTransactions: await Transaction.countDocuments(),
      totalBalance: await User.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ])
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching health stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard overview
router.get('/dashboard', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      pendingFinancialTransactions,
      totalBalance,
      recentTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ 
        type: { $in: ['deposit', 'withdrawal'] },
        status: 'pending' 
      }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
      Transaction.find({ type: { $in: ['deposit', 'withdrawal'] } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalTransactions,
        pendingFinancialTransactions,
        totalBalance: totalBalance[0]?.total || 0
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get system statistics
router.get('/stats', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      pendingDeposits,
      pendingWithdrawals,
      totalOrders,
      openOrders,
      totalBalance
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
      Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['OPEN', 'PARTIAL'] } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }])
    ]);

    res.json({
      users: totalUsers,
      transactions: totalTransactions,
      pendingDeposits,
      pendingWithdrawals,
      orders: totalOrders,
      openOrders,
      totalBalance: totalBalance[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;