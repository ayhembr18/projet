const express = require('express');
const router = express.Router();
const axios = require('axios');
const Employee = require('../models/Employee');
const { requireEmployee } = require('../middleware/auth');

router.use(requireEmployee);

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// GET /api/employee/me
router.get('/me', async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id).select('-password');
    res.json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/employee/change-password
router.patch('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    const employee = await Employee.findById(req.employee._id).select('+password');
    const valid = await employee.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    employee.password = newPassword;
    employee.mustChangePassword = false;
    await employee.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/employee/hr-profile
router.put('/hr-profile', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.employee._id,
      { hrProfile: req.body, profileCompleted: true },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'HR profile saved', employee });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/employee/skill-profile
router.put('/skill-profile', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.employee._id,
      { skillProfile: req.body },
      { new: true }
    ).select('-password');
    res.json({ message: 'Skill profile saved', employee });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/employee/analyze
router.post('/analyze', async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id);

    if (!employee.hrProfile || !employee.hrProfile.jobSatisfaction) {
      return res.status(400).json({ message: 'Please complete your HR profile first' });
    }
    if (!employee.skillProfile || !employee.skillProfile.role) {
      return res.status(400).json({ message: 'Please complete your skill profile first' });
    }

    const skillData = {
      name: `${employee.firstName} ${employee.lastName}`,
      role: employee.skillProfile.role,
      current_skills: employee.skillProfile.currentSkills || [],
      years_experience: employee.skillProfile.yearsExperience || 0,
      proficiency_avg: employee.skillProfile.proficiencyAvg || 0.5,
      learning_velocity: employee.skillProfile.learningVelocity || 0.5,
    };

    const hrData = {
      EmployeeNumber: employee._id.toString(),
      Age: employee.hrProfile.age || 30,
      Gender: employee.hrProfile.gender || 'Male',
      Education: employee.hrProfile.education || 3,
      EducationField: employee.hrProfile.educationField || 'Technical Degree',
      Department: employee.department,
      JobRole: employee.hrProfile.jobRole || employee.jobTitle,
      JobLevel: employee.hrProfile.jobLevel || 2,
      YearsAtCompany: employee.hrProfile.yearsAtCompany || 0,
      YearsInCurrentRole: employee.hrProfile.yearsInCurrentRole || 0,
      YearsSinceLastPromotion: employee.hrProfile.yearsSinceLastPromotion || 0,
      YearsWithCurrManager: employee.hrProfile.yearsWithCurrManager || 0,
      TotalWorkingYears: employee.hrProfile.totalWorkingYears || 0,
      NumCompaniesWorked: employee.hrProfile.numCompaniesWorked || 1,
      TrainingTimesLastYear: employee.hrProfile.trainingTimesLastYear || 0,
      PerformanceRating: employee.hrProfile.performanceRating || 3,
      PercentSalaryHike: employee.hrProfile.percentSalaryHike || 14,
      StockOptionLevel: employee.hrProfile.stockOptionLevel || 0,
      JobSatisfaction: employee.hrProfile.jobSatisfaction || 3,
      WorkLifeBalance: employee.hrProfile.workLifeBalance || 3,
      EnvironmentSatisfaction: employee.hrProfile.environmentSatisfaction || 3,
      RelationshipSatisfaction: employee.hrProfile.relationshipSatisfaction || 3,
      JobInvolvement: employee.hrProfile.jobInvolvement || 3,
      MonthlyIncome: employee.hrProfile.monthlyIncome || 5000,
      DailyRate: 500,
      HourlyRate: 60,
      MonthlyRate: 12000,
      OverTime: employee.hrProfile.overTime || 'No',
      BusinessTravel: employee.hrProfile.businessTravel || 'Travel_Rarely',
      DistanceFromHome: employee.hrProfile.distanceFromHome || 10,
    };

    let skillAnalysis = null;
    let hrPredictions = null;
    const errors = [];

    try {
      const skillRes = await axios.post(`${AI_SERVICE}/analyze`, skillData, { timeout: 60000 });
      // The model wraps its response: { skillAnalysis: { coverage_score, ... } }
      // We unwrap it so we store the flat object directly.
      skillAnalysis = skillRes.data?.skillAnalysis || skillRes.data;
      console.log(' Skill Analysis received');
    } catch (e) {
      console.error(' Skill Analysis Error:', e.message);
      errors.push(`Skill analysis: ${e.message}`);
    }

    try {
      const hrRes = await axios.post(`${AI_SERVICE}/predict`, hrData, { timeout: 60000 });
      // The model wraps its response: { hrPredictions: { predictions: {...}, insights: [...] } }
      // We unwrap it so we store the inner object directly.
      hrPredictions = hrRes.data?.hrPredictions || hrRes.data;
      console.log(' HR Predictions received');
    } catch (e) {
      console.error(' HR Predictions Error:', e.message);
      errors.push(`HR prediction: ${e.message}`);
    }

    // Save the unwrapped results
    employee.aiResults = {
      skillAnalysis,
      hrPredictions,
      analyzedAt: new Date(),
    };

    await employee.save();
    console.log(' AI results saved for:', employee.firstName);

    res.json({
      message: errors.length === 0 ? 'Analysis complete' : 'Partial analysis complete',
      results: employee.aiResults,
      errors,
    });
  } catch (err) {
    console.error('Critical Error during analysis:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employee/my-results
router.get('/my-results', async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee._id)
        .select('aiResults skillProfile hrProfile profileCompleted firstName lastName');

    res.json({
      results: employee.aiResults || null,
      employee,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;