const express = require('express');
const router = express.Router();
const { 
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  getAllDoctors,
  getDoctorsByDepartment
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/all', getAllDoctors);
router.get('/department/:department', getDoctorsByDepartment);

// Protected routes (doctors only)
router.get('/profile', protect, doctorOnly, getDoctorProfile);
router.put('/profile', protect, doctorOnly, updateDoctorProfile);
router.get('/appointments', protect, doctorOnly, getDoctorAppointments);
router.put('/appointment/status', protect, doctorOnly, updateAppointmentStatus);
router.post('/appointment/prescription', protect, doctorOnly, addPrescription);

module.exports = router;