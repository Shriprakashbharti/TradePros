import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Instrument from '../models/Instrument.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trading');
  
  // Clear existing instruments
  await Instrument.deleteMany({});
  
  // Insert Indian market instruments
  await Instrument.insertMany([
    // Nifty indices
    { symbol: 'NIFTY50', name: 'Nifty 50 Index', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'BANKNIFTY', name: 'Nifty Bank Index', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'NIFTYIT', name: 'Nifty IT Index', tickSize: 0.05, lotSize: 1, active: true },
    
    // Large cap stocks
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'INFY', name: 'Infosys Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'SBIN', name: 'State Bank of India', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'ITC', name: 'ITC Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', tickSize: 0.05, lotSize: 1, active: true },
    
    // Mid cap stocks
    { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'TITAN', name: 'Titan Company Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'NTPC', name: 'NTPC Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', tickSize: 0.05, lotSize: 1, active: true },
    
    // Small cap and other popular stocks
    { symbol: 'WIPRO', name: 'Wipro Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', tickSize: 0.05, lotSize: 1, active: true },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', tickSize: 0.05, lotSize: 1, active: true },
    
    // International stocks (for diversification)
    { symbol: 'AAPL', name: 'Apple Inc', tickSize: 0.01, lotSize: 1, active: true },
    { symbol: 'MSFT', name: 'Microsoft Corporation', tickSize: 0.01, lotSize: 1, active: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc', tickSize: 0.01, lotSize: 1, active: true },
    
    // Cryptocurrencies
    { symbol: 'BTCINR', name: 'Bitcoin Indian Rupee', tickSize: 0.1, lotSize: 0.001, active: true },
    { symbol: 'ETHINR', name: 'Ethereum Indian Rupee', tickSize: 0.1, lotSize: 0.01, active: true }
  ]);

  // Create admin user
  // const adminEmail = 'admin@example.com';
  // const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  // await User.updateOne(
  //   { email: adminEmail }, 
  //   { 
  //     name: 'Admin', 
  //     email: adminEmail, 
  //     passwordHash, 
  //     role: 'admin',
  //     balance: 1000000, // Starting balance for admin
  //     isActive: true
  //   }, 
  //   { upsert: true }
  // );

 

  console.log('Seed complete - Indian market instruments added');
  console.log('Admin user: admin@example.com / AdminPass123!');
  console.log('Demo user: demo@example.com / DemoPass123!');
  
  await mongoose.disconnect();
}

run().catch((e) => { 
  console.error('Seed error:', e); 
  process.exit(1); 
});