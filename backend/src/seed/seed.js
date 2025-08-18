import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Instrument from '../models/Instrument.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trading');
  await Instrument.deleteMany({});
  await Instrument.insertMany([
    { symbol: 'AAPL', name: 'Apple Inc', tickSize: 0.01, lotSize: 1, active: true },
    { symbol: 'BTCUSDT', name: 'Bitcoin Tether', tickSize: 0.1, lotSize: 0.001, active: true },
    { symbol: 'NIFTY', name: 'NIFTY Index', tickSize: 0.05, lotSize: 1, active: true }
  ]);

  const adminEmail = 'admin@example.com';
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  await User.updateOne({ email: adminEmail }, { name: 'Admin', email: adminEmail, passwordHash, role: 'admin' }, { upsert: true });

  console.log('Seed complete');
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });


