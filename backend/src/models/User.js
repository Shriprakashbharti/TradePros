import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }]
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

schema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', schema);


