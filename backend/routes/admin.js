const express = require('express');
const router = express.Router();
const Enterprise = require('../models/Enterprise');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const { requireAdmin } = require('../middleware/auth');

// All routes require admin auth
router.use(requireAdmin);

// GET /api/admin/dashboard — summary stats
router.get('/dashboard', async (req, res) => {
  try {
    const [totalEnterprises, pending, approved, denied, totalEmployees] = await Promise.all([
      Enterprise.countDocuments(),
      Enterprise.countDocuments({ status: 'pending' }),
      Enterprise.countDocuments({ status: 'approved' }),
      Enterprise.countDocuments({ status: 'denied' }),
      Employee.countDocuments({ isActive: true }),
    ]);
    res.json({ totalEnterprises, pending, approved, denied, totalEmployees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/enterprises — list all with optional status filter
router.get('/enterprises', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const enterprises = await Enterprise.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Enterprise.countDocuments(filter);
    res.json({ enterprises, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/enterprises/:id
router.get('/enterprises/:id', async (req, res) => {
  try {
    const enterprise = await Enterprise.findById(req.params.id);
    if (!enterprise) return res.status(404).json({ message: 'Not found' });
    const employees = await Employee.find({ enterpriseId: enterprise._id }).select('-password -temporaryPassword');
    res.json({ enterprise, employees });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/enterprises/:id/approve
router.patch('/enterprises/:id/approve', async (req, res) => {
  try {
    const { note } = req.body;
    const enterprise = await Enterprise.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date(), adminNote: note || '' },
      { new: true }
    );
    if (!enterprise) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Enterprise approved', enterprise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/enterprises/:id/deny
router.patch('/enterprises/:id/deny', async (req, res) => {
  try {
    const { note } = req.body;
    const enterprise = await Enterprise.findByIdAndUpdate(
      req.params.id,
      { status: 'denied', deniedAt: new Date(), adminNote: note || '' },
      { new: true }
    );
    if (!enterprise) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Enterprise denied', enterprise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/me
router.get('/me', async (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;