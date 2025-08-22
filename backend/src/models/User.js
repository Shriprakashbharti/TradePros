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
    profile: {
      phone: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String
      },
      panNumber: { type: String, uppercase: true },
      aadhaarNumber: { type: String },
      dateOfBirth: { type: Date },
      bankAccounts: [{
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        accountHolderName: String,
        isPrimary: { type: Boolean, default: false }
      }],
      profileImage: { type: String }
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      },
      riskProfile: {
        type: String,
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
      }
    },
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
    orders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }],
    lastLogin: { type: Date },
    loginHistory: [{
      timestamp: { type: Date, default: Date.now },
      ipAddress: String,
      userAgent: String
    }]
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

schema.index({ email: 1 }, { unique: true });

// Virtual for available balance
schema.virtual('availableBalance').get(function() {
  return this.balance - this.reservedBalance;
});

// Method to update profile
schema.methods.updateProfile = function(profileData) {
  this.profile = { ...this.profile, ...profileData };
  return this.save();
};

// Method to add bank account
schema.methods.addBankAccount = function(bankAccountData) {
  // If setting as primary, remove primary from others
  if (bankAccountData.isPrimary) {
    this.profile.bankAccounts.forEach(acc => {
      acc.isPrimary = false;
    });
  }
  
  this.profile.bankAccounts.push(bankAccountData);
  return this.save();
};

export default mongoose.model('User', schema);