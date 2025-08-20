import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, index: true },
    qty: { type: Number, default: 0 },
    avgPrice: { type: Number, default: 0 },
    unrealizedPnL: { type: Number, default: 0 },
    realizedPnL: { type: Number, default: 0 },
    reservedQty: { type: Number, default: 0 }

  },
  { timestamps: { updatedAt: 'updatedAt' } }
);

schema.index({ user: 1, symbol: 1 }, { unique: true });

export default mongoose.model('Position', schema);


