const express = require('express');
const router = express.Router();
const { 
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  getAllDoctors,
  getDoctorsByDepartment,
  getDoctorPatients,
  createReferral,
  getSentReferrals,
  getReceivedReferrals,
  updateReferralStatus,
  changePassword
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
router.get('/patients', protect, doctorOnly, getDoctorPatients);

// Add these new routes
router.post('/refer', protect, doctorOnly, createReferral);
router.get('/referrals/sent', protect, doctorOnly, getSentReferrals);
router.get('/referrals/received', protect, doctorOnly, getReceivedReferrals);
router.put('/referrals/:referralId/:action', protect, doctorOnly, updateReferralStatus);
router.put('/change-password', protect, doctorOnly, changePassword);

module.exports = router;