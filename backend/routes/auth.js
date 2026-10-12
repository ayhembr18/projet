const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Enterprise = require('../models/Enterprise');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── Enterprise Auth ─────────────────────────────────────────────────────────

// POST /api/auth/enterprise/register  — submit application form
router.post('/enterprise/register', async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await Enterprise.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const enterprise = await Enterprise.create(req.body);
    res.status(201).json({
      message: 'Application submitted successfully. You will be notified once reviewed.',
      enterpriseId: enterprise._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/enterprise/login
router.post('/enterprise/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const enterprise = await Enterprise.findOne({ email }).select('+password');
    if (!enterprise || !(await enterprise.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (enterprise.status === 'pending') {
      return res.status(403).json({ message: 'Your application is still under review.' });
    }
    if (enterprise.status === 'denied') {
      return res.status(403).json({
        message: `Your application was denied. ${enterprise.adminNote || ''}`.trim()
      });
    }

    const token = signToken({ id: enterprise._id, role: 'enterprise', email: enterprise.email });
    res.json({ token, enterprise: enterprise.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/enterprise/status — check application status (no auth needed)
router.get('/enterprise/status/:email', async (req, res) => {
  try {
    const enterprise = await Enterprise.findOne({ email: req.params.email });
    if (!enterprise) return res.status(404).json({ message: 'Not found' });
    res.json({ status: enterprise.status, adminNote: enterprise.adminNote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Employee Auth ────────────────────────────────────────────────────────────

// POST /api/auth/employee/login
router.post('/employee/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const employee = await Employee.findOne({ username }).select('+password');
    if (!employee || !employee.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!(await employee.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({
      id: employee._id,
      role: 'employee',
      enterpriseId: employee.enterpriseId,
      username: employee.username,
    });

    res.json({
      token,
      employee: employee.toJSON(),
      mustChangePassword: employee.mustChangePassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin Auth ───────────────────────────────────────────────────────────────

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ id: admin._id, role: 'platform_admin', email: admin.email });
    res.json({ token, admin: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;