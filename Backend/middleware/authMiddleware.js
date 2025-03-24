const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Middleware to verify token and protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set user in req based on role
      if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'patient') {
        req.user = await Patient.findById(decoded.id).select('-password');
      }

      // Add role to the request
      req.userRole = decoded.role;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Middleware to check if user is a doctor
const doctorOnly = (req, res, next) => {
  if (req.userRole === 'doctor') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Doctors only.' });
  }
};

// Middleware to check if user is a patient
const patientOnly = (req, res, next) => {
  if (req.userRole === 'patient') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Patients only.' });
  }
};

// Check the export names - you're importing 'doctorProtect' but it might be called 'doctorOnly'

// Make sure these exports match what you're importing
module.exports = {
  protect,
  doctorOnly,   // This should match what you're importing in reportRoutes.js
  patientOnly
};