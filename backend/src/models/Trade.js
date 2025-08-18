import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, index: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

schema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Trade', schema);


