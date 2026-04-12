const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Enterprise = require('../models/Enterprise');
const { requireEnterprise } = require('../middleware/auth');
const { generateCredentials } = require('../utils/credentials');

router.use(requireEnterprise);

// GET /api/enterprise/me
router.get('/me', async (req, res) => {
  try {
    const enterprise = await Enterprise.findById(req.enterprise._id);
    res.json({ enterprise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enterprise/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const employees = await Employee.find({ enterpriseId: req.enterprise._id })
      .select('-password')
      .sort({ createdAt: -1 });

    const stats = {
      total: employees.length,
      profileCompleted: employees.filter(e => e.profileCompleted).length,
      analyzed: employees.filter(e => e.aiResults && e.aiResults.skillAnalysis).length,
      // hrPredictions is stored unwrapped: { predictions: { attrition_risk, ... }, insights }
      highAttritionRisk: employees.filter(
        e => e.aiResults?.hrPredictions?.predictions?.attrition_risk?.level === 'High'
      ).length,
      promotionReady: employees.filter(
        e => e.aiResults?.hrPredictions?.predictions?.promotion_readiness?.status === 'Ready'
      ).length,
    };

    res.json({ employees, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enterprise/employees
router.get('/employees', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const employees = await Employee.find({ enterpriseId: req.enterprise._id })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Employee.countDocuments({ enterpriseId: req.enterprise._id });
    res.json({ employees, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enterprise/employees/:id
router.get('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      enterpriseId: req.enterprise._id,
    }).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/enterprise/employees — add employee, auto-generate credentials
router.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, jobTitle, department } = req.body;
    if (!firstName || !lastName || !email || !jobTitle || !department) {
      return res.status(400).json({
        message: 'firstName, lastName, email, jobTitle, and department are required',
      });
    }

    const emailExists = await Employee.findOne({ email, enterpriseId: req.enterprise._id });
    if (emailExists) {
      return res.status(409).json({ message: 'An employee with this email already exists' });
    }

    const { username, plainPassword } = generateCredentials(firstName, lastName);

    // Ensure username uniqueness
    let finalUsername = username;
    let attempt = 0;
    while (await Employee.findOne({ username: finalUsername })) {
      attempt++;
      finalUsername = `${username}${attempt}`;
    }

    const employee = new Employee({
      enterpriseId: req.enterprise._id,
      username: finalUsername,
      password: plainPassword,        // hashed by pre-save hook
      temporaryPassword: plainPassword,
      firstName,
      lastName,
      email,
      jobTitle,
      department,
    });

    await employee.save();

    await Enterprise.findByIdAndUpdate(req.enterprise._id, { $inc: { employeeCount: 1 } });

    res.status(201).json({
      message: 'Employee added successfully',
      employee: {
        ...employee.toJSON(),
        credentials: {
          username: finalUsername,
          temporaryPassword: plainPassword,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/login`,
        },
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/enterprise/employees/:id — update basic info
router.patch('/employees/:id', async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'email', 'jobTitle', 'department', 'isActive'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, enterpriseId: req.enterprise._id },
      updates,
      { new: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/enterprise/employees/:id — soft delete
router.delete('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, enterpriseId: req.enterprise._id },
      { isActive: false },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    await Enterprise.findByIdAndUpdate(req.enterprise._id, { $inc: { employeeCount: -1 } });
    res.json({ message: 'Employee deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/enterprise/employees/:id/reset-credentials
router.post('/employees/:id/reset-credentials', async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      enterpriseId: req.enterprise._id,
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const { plainPassword } = generateCredentials(employee.firstName, employee.lastName);
    employee.password = plainPassword;
    employee.temporaryPassword = plainPassword;
    employee.mustChangePassword = true;
    await employee.save();

    res.json({
      message: 'Credentials reset',
      credentials: {
        username: employee.username,
        temporaryPassword: plainPassword,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;