const express = require('express');
const router = express.Router();
const { 
  getPatientProfile,
  updatePatientProfile,
  bookAppointment,
  verifyPayment,
  getPatientAppointments,
  cancelAppointment,
  generateBill
} = require('../controllers/patientController');
const { protect, patientOnly } = require('../middleware/authMiddleware');

// Protected routes (patients only)
router.get('/profile', protect, patientOnly, getPatientProfile);
router.put('/profile', protect, patientOnly, updatePatientProfile);
router.post('/appointment', protect, patientOnly, bookAppointment);
router.post('/payment/verify', protect, patientOnly, verifyPayment);
router.get('/appointments', protect, patientOnly, getPatientAppointments);
router.put('/appointment/:appointmentId/cancel', protect, patientOnly, cancelAppointment);
router.get('/bill/:appointmentId', protect, patientOnly, generateBill);

module.exports = router;