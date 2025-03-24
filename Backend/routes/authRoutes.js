const express = require('express');
const router = express.Router();
const { 
  registerDoctor, 
  registerPatient, 
  loginDoctor, 
  loginPatient 
} = require('../controllers/authController');

// Register routes
router.post('/register/doctor', registerDoctor);
router.post('/register/patient', registerPatient);

// Login routes
router.post('/login/doctor', loginDoctor);
router.post('/login/patient', loginPatient);




module.exports = router;