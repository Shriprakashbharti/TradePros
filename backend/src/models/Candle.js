import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true, index: true },
    timeframe: { type: String, enum: ['1m', '5m', '15m', '1h', '1d'], default: '1m', index: true },
    o: { type: Number, required: true },
    h: { type: Number, required: true },
    l: { type: Number, required: true },
    c: { type: Number, required: true },
    v: { type: Number, required: true },
    ts: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

schema.index({ symbol: 1, ts: 1 }, { unique: true });

export default mongoose.model('Candle', schema);


