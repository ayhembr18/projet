const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  enterpriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enterprise', required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  temporaryPassword: { type: String, select: false },
  mustChangePassword: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },

  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, lowercase: true, trim: true },
  jobTitle:  { type: String, required: true },
  department:{ type: String, required: true },

  profileCompleted: { type: Boolean, default: false },

  hrProfile: {
    age: Number,
    gender: String,
    education: Number,
    educationField: String,
    jobRole: String,
    jobLevel: Number,
    yearsAtCompany: Number,
    yearsInCurrentRole: Number,
    yearsSinceLastPromotion: Number,
    yearsWithCurrManager: Number,
    totalWorkingYears: Number,
    numCompaniesWorked: Number,
    trainingTimesLastYear: Number,
    performanceRating: Number,
    percentSalaryHike: Number,
    stockOptionLevel: Number,
    jobSatisfaction: Number,
    workLifeBalance: Number,
    environmentSatisfaction: Number,
    relationshipSatisfaction: Number,
    jobInvolvement: Number,
    monthlyIncome: Number,
    overTime: String,
    businessTravel: String,
    distanceFromHome: Number,
  },

  skillProfile: {
    role: String,
    currentSkills: [String],
    yearsExperience: Number,
    proficiencyAvg: Number,
    learningVelocity: Number,
  },

  // Stored exactly as the AI service returns it
  aiResults: {
    skillAnalysis: { type: mongoose.Schema.Types.Mixed, default: null },
    hrPredictions: { type: mongoose.Schema.Types.Mixed, default: null },
    analyzedAt: Date,
  },
}, { timestamps: true });

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employeeSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

employeeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.temporaryPassword;
  return obj;
};

module.exports = mongoose.model('Employee', employeeSchema);