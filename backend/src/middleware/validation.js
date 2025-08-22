import Joi from 'joi';

// Add these to your existing validation functions

export const validateProfileUpdate = (req, res, next) => {
  const schema = Joi.object({
    profile: Joi.object({
      phone: Joi.string().pattern(/^[0-9]{10}$/),
      address: Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        country: Joi.string(),
        pincode: Joi.string().pattern(/^[0-9]{6}$/)
      }),
      panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
      aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
      dateOfBirth: Joi.date().max(new Date()),
      profileImage: Joi.string().uri()
    }),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        sms: Joi.boolean(),
        push: Joi.boolean()
      }),
      riskProfile: Joi.string().valid('conservative', 'moderate', 'aggressive')
    })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

export const validateBankAccount = (req, res, next) => {
  const schema = Joi.object({
    accountNumber: Joi.string().pattern(/^[0-9]{9,18}$/).required(),
    bankName: Joi.string().required(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    accountHolderName: Joi.string().required(),
    isPrimary: Joi.boolean()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};