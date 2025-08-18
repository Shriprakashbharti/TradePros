import express from 'express'
import Transaction from '../models/Transaction.js'
import User from '../models/User.js'

const router = express.Router()

// Deposit endpoint
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, method, reference } = req.body
console.log(req.body)
    // Validate input
    if (!userId || !amount || amount < 10) {
      return res.status(400).json({ message: 'Invalid deposit amount (minimum $10)' })
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount,
      method,
      reference,
      status: method === 'manual_deposit' ? 'pending' : 'completed'
    })

    await transaction.save()

    // Update user balance if not manual deposit
    if (method !== 'manual_deposit') {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: amount }
      })
    }

    res.status(201).json({ 
      message: 'Deposit successful',
      transactionId: transaction._id
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Withdraw endpoint
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount, method, accountDetails } = req.body

    // Validate input
    if (!userId || !amount || amount < 10) {
      return res.status(400).json({ message: 'Invalid withdrawal amount (minimum $10)' })
    }

    // Check user balance
    const user = await User.findById(userId)
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'withdrawal',
      amount,
      method,
      accountDetails,
      status: 'pending' // Requires admin approval
    })

    await transaction.save()

    // Reserve funds by deducting from available balance
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
      $inc: { reservedBalance: amount }
    })

    res.status(201).json({ 
      message: 'Withdrawal request submitted',
      transactionId: transaction._id
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router