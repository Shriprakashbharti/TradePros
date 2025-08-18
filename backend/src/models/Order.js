import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, index: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    type: { type: String, enum: ['MARKET', 'LIMIT'], required: true },
    price: { type: Number },
    qty: { type: Number, required: true },
    status: { type: String, enum: ['OPEN', 'PARTIAL', 'FILLED', 'CANCELLED'], default: 'OPEN', index: true },
    filledQty: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

schema.index({ symbol: 1, status: 1 });

export default mongoose.model('Order', schema);


