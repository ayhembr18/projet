const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const enterpriseSchema = new mongoose.Schema({
  // Company info
  companyName: { type: String, required: true, trim: true },
  industry: { type: String, required: true },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  description: { type: String },

  // Contact / Auth
  contactName: { type: String, required: true },
  contactTitle: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String, required: true },

  // Platform status
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  adminNote: { type: String, default: '' },
  approvedAt: { type: Date },
  deniedAt: { type: Date },

  // Stats (computed)
  employeeCount: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before save
enterpriseSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

enterpriseSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

enterpriseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Enterprise', enterpriseSchema);