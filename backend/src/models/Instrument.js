import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    tickSize: { type: Number, required: true },
    lotSize: { type: Number, required: true },
    active: { type: Boolean, default: true },
    lastPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ symbol: 1 }, { unique: true });

export default mongoose.model('Instrument', schema);


