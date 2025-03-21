const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new doctor
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, department, specialization, fee, phoneNumber } = req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }

    // Create new doctor
    const doctor = await Doctor.create({
      name,
      email,
      password,
      department,
      specialization: specialization || [],
      fee,
      phoneNumber
    });

    if (doctor) {
      res.status(201).json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        department: doctor.department,
        token: generateToken(doctor._id, 'doctor'),
      });
    } else {
      res.status(400).json({ error: 'Invalid doctor data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Register a new patient
const registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender, phoneNumber, address } = req.body;

    // Check if patient already exists
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ error: 'Patient already exists' });
    }

    // Create new patient
    const patient = await Patient.create({
      name,
      email,
      password,
      age,
      gender,
      phoneNumber,
      address
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        token: generateToken(patient._id, 'patient'),
      });
    } else {
      res.status(400).json({ error: 'Invalid patient data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login for doctor
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find doctor by email
    const doctor = await Doctor.findOne({ email });

    // Check if doctor exists and password matches
    if (doctor && (await doctor.matchPassword(password))) {
      res.json({
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        department: doctor.department,
        token: generateToken(doctor._id, 'doctor'),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login for patient
const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find patient by email
    const patient = await Patient.findOne({ email });

    // Check if patient exists and password matches
    if (patient && (await patient.matchPassword(password))) {
      res.json({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        token: generateToken(patient._id, 'patient'),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  registerDoctor,
  registerPatient,
  loginDoctor,
  loginPatient
};