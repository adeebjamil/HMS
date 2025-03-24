const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Referral = require('../models/Referral');
const Patient = require('../models/Patient'); // Add this missing import
const asyncHandler = require('express-async-handler'); // Add this missing import
const generateToken = require('../utils/generateToken'); // Add this missing import

// Get doctor profile
const getDoctorProfile = asyncHandler(async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id).select('-password');
    
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ error: 'Doctor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update doctor profile
const updateDoctorProfile = asyncHandler(async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user._id);
    
    if (doctor) {
      doctor.name = req.body.name || doctor.name;
      doctor.email = req.body.email || doctor.email;
      doctor.department = req.body.department || doctor.department;
      doctor.specialization = req.body.specialization || doctor.specialization;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.fee = req.body.fee || doctor.fee;
      doctor.availability = req.body.availability || doctor.availability;
      doctor.bio = req.body.bio || doctor.bio;
      doctor.phoneNumber = req.body.phoneNumber || doctor.phoneNumber;
      doctor.address = req.body.address || doctor.address;
      
      if (req.body.password) {
        doctor.password = req.body.password;
      }
      
      const updatedDoctor = await doctor.save();
      
      res.json({
        _id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        department: updatedDoctor.department,
        specialization: updatedDoctor.specialization,
        experience: updatedDoctor.experience,
        fee: updatedDoctor.fee,
        availability: updatedDoctor.availability,
        bio: updatedDoctor.bio,
        phoneNumber: updatedDoctor.phoneNumber,
        address: updatedDoctor.address
      });
    } else {
      res.status(404).json({ error: 'Doctor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phoneNumber age gender')
      .sort({ appointmentDate: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment status
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    appointment.status = status;
    
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add prescription to appointment
const addPrescription = asyncHandler(async (req, res) => {
  try {
    const { appointmentId, medications, notes, followUpDate } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }
    
    appointment.prescription = {
      medications,
      notes,
      followUpDate
    };
    
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all doctors (for patient booking)
const getAllDoctors = asyncHandler(async (req, res) => {
  try {
    // Modified to return all doctors regardless of approval status
    const doctors = await Doctor.find({})
      .select('-password')
      .sort({ name: 1 });
    
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get doctors by department
const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  try {
    const { department } = req.params;
    
    // Modified to return all doctors in a department regardless of approval
    const doctors = await Doctor.find({ department })
      .select('-password')
      .sort({ name: 1 });
    
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get patients for a doctor
const getDoctorPatients = asyncHandler(async (req, res) => {
  try {
    console.log('Getting patients for doctor:', req.user._id);
    
    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phoneNumber age gender bloodGroup medicalHistory allergies')
      .sort({ appointmentDate: -1 });
    
    // Create a map to store unique patients with their appointment history
    const patientMap = new Map();
    
    // Process appointments to build patient data
    appointments.forEach(app => {
      if (!app.patient) return;
      
      const patientId = app.patient._id.toString();
      
      if (!patientMap.has(patientId)) {
        // For first occurrence, create the patient object
        patientMap.set(patientId, {
          _id: app.patient._id,
          name: app.patient.name,
          email: app.patient.email,
          phone: app.patient.phoneNumber,
          age: app.patient.age,
          gender: app.patient.gender,
          bloodGroup: app.patient.bloodGroup,
          medicalHistory: app.patient.medicalHistory || [],
          allergies: app.patient.allergies || [],
          lastVisit: new Date(app.appointmentDate), // Initial value
          totalVisits: app.status === 'Completed' ? 1 : 0,
          appointments: [{
            _id: app._id,
            appointmentDate: app.appointmentDate,
            timeSlot: app.timeSlot,
            status: app.status,
            type: app.type || 'Consultation',
            problem: app.problem,
            prescription: app.prescription
          }]
        });
      } else {
        // For existing patients, update data and add appointment
        const patient = patientMap.get(patientId);
        
        // Update last visit if newer
        const appDate = new Date(app.appointmentDate);
        if (appDate > patient.lastVisit) {
          patient.lastVisit = appDate;
        }
        
        // Increment total visits if completed
        if (app.status === 'Completed') {
          patient.totalVisits += 1;
        }
        
        // Add appointment to history
        patient.appointments.push({
          _id: app._id,
          appointmentDate: app.appointmentDate,
          timeSlot: app.timeSlot,
          status: app.status,
          type: app.type || 'Consultation',
          problem: app.problem,
          prescription: app.prescription
        });
      }
    });
    
    // Convert map to array
    const patients = Array.from(patientMap.values());
    
    console.log(`Found ${patients.length} patients for doctor ${req.user._id}`);
    
    res.json(patients);
  } catch (error) {
    console.error('Error in getDoctorPatients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Create a referral to another doctor
const createReferral = asyncHandler(async (req, res) => {
  try {
    const { patientId, doctorId, referralDate, notes } = req.body;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Create referral
    const referral = new Referral({
      patient: patientId,
      fromDoctor: req.user._id,
      toDoctor: doctorId,
      referralDate: new Date(referralDate),
      notes
    });
    
    const savedReferral = await referral.save();
    
    // Populate doctor and patient info for response
    const populatedReferral = await Referral.findById(savedReferral._id)
      .populate('patient', 'name email age gender')
      .populate('fromDoctor', 'name department specialization')
      .populate('toDoctor', 'name department specialization');
    
    res.status(201).json(populatedReferral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

// Get referrals sent by this doctor
const getSentReferrals = asyncHandler(async (req, res) => {
  try {
    const referrals = await Referral.find({ fromDoctor: req.user._id })
      .populate('patient', 'name email age gender')
      .populate('toDoctor', 'name department specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Error getting sent referrals:', error);
    res.status(500).json({ error: 'Failed to get referrals' });
  }
});

// Get referrals received by this doctor
const getReceivedReferrals = asyncHandler(async (req, res) => {
  try {
    const referrals = await Referral.find({ toDoctor: req.user._id })
      .populate('patient', 'name email age gender')
      .populate('fromDoctor', 'name department specialization')
      .sort({ createdAt: -1 });
    
    res.json(referrals);
  } catch (error) {
    console.error('Error getting received referrals:', error);
    res.status(500).json({ error: 'Failed to get referrals' });
  }
});

// Update referral status (accept/decline)
const updateReferralStatus = asyncHandler(async (req, res) => {
  try {
    const { referralId } = req.params;
    const { action } = req.params;
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }
    
    // Check if this doctor is authorized to update this referral
    if (referral.toDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this referral' });
    }
    
    referral.status = action === 'accept' ? 'accepted' : 'declined';
    const updatedReferral = await referral.save();
    
    res.json(updatedReferral);
  } catch (error) {
    console.error(`Error ${req.params.action}ing referral:`, error);
    res.status(500).json({ error: `Failed to ${req.params.action} referral` });
  }
});

// Add this function to your existing controller
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords');
  }
  
  const doctor = await Doctor.findById(req.user._id);
  
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  
  // Check if current password matches
  const isMatch = await doctor.matchPassword(currentPassword);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  doctor.password = newPassword;
  await doctor.save();
  
  // Generate new token
  const token = generateToken(doctor._id);
  
  res.json({
    message: 'Password updated successfully',
    token
  });
});

module.exports = {
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
};