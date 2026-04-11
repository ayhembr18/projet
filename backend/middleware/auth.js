const jwt = require('jsonwebtoken');
const Enterprise = require('../models/Enterprise');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
};

// Generic auth check
const authenticate = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Enterprise-only guard
const requireEnterprise = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'enterprise') return res.status(403).json({ message: 'Enterprise access required' });

    const enterprise = await Enterprise.findById(decoded.id);
    if (!enterprise) return res.status(401).json({ message: 'Enterprise not found' });
    if (enterprise.status !== 'approved') return res.status(403).json({ message: 'Enterprise not approved yet' });

    req.enterprise = enterprise;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Employee-only guard
const requireEmployee = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'employee') return res.status(403).json({ message: 'Employee access required' });

    const employee = await Employee.findById(decoded.id);
    if (!employee || !employee.isActive) return res.status(401).json({ message: 'Employee not found or inactive' });

    req.employee = employee;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin-only guard
const requireAdmin = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = verifyToken(token);
    if (decoded.role !== 'platform_admin') return res.status(403).json({ message: 'Admin access required' });

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    req.admin = admin;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticate, requireEnterprise, requireEmployee, requireAdmin };