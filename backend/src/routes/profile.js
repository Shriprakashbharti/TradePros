import express from 'express';
import User from '../models/User.js';
import {auth} from '../middleware/auth.js';
import { validateProfileUpdate, validateBankAccount } from '../middleware/validation.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
      .select('-passwordHash')
      .populate('transactions', 'amount type createdAt')
      .populate('orders', 'symbol quantity price status');

    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/', auth, validateProfileUpdate, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const user = await User.findById(req.user.sub);
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.sub)
      .select('-passwordHash');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add bank account
router.post('/bank-accounts', auth, validateBankAccount, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    await user.addBankAccount(req.body);
    
    const updatedUser = await User.findById(req.user.sub)
      .select('-passwordHash');
    
    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update bank account
router.put('/bank-accounts/:accountId', auth, validateBankAccount, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const accountId = req.params.accountId;
    
    // Find the account index
    const accountIndex = user.profile.bankAccounts.findIndex(
      acc => acc._id.toString() === accountId
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // If setting as primary, remove primary from others
    if (req.body.isPrimary) {
      user.profile.bankAccounts.forEach(acc => {
        acc.isPrimary = false;
      });
    }
    
    // Update the account
    user.profile.bankAccounts[accountIndex] = {
      ...user.profile.bankAccounts[accountIndex].toObject(),
      ...req.body
    };
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.sub)
      .select('-passwordHash');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete bank account
router.delete('/bank-accounts/:accountId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    const accountId = req.params.accountId;
    
    user.profile.bankAccounts = user.profile.bankAccounts.filter(
      acc => acc._id.toString() !== accountId
    );
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.sub)
      .select('-passwordHash');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get account summary
router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
      .select('balance reservedBalance transactions orders createdAt');
    
    // Calculate some summary statistics
    const totalTransactions = user.transactions.length;
    const totalOrders = user.orders.length;
    const activeOrders = user.orders.filter(order => 
      ['PENDING', 'PARTIALLY_FILLED'].includes(order.status)
    ).length;
    
    const summary = {
      availableBalance: user.balance - user.reservedBalance,
      totalBalance: user.balance,
      reservedBalance: user.reservedBalance,
      totalTransactions,
      totalOrders,
      activeOrders,
      memberSince: user.createdAt
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add this to your auth routes
router.post('/change-password', auth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.sub);
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      user.passwordHash = newPasswordHash;
      await user.save();
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


export default router;