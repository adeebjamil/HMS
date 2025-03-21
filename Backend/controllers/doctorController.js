const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Get doctor profile
const getDoctorProfile = async (req, res) => {
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
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
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
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phoneNumber age gender')
      .sort({ appointmentDate: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
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
};

// Add prescription to appointment
const addPrescription = async (req, res) => {
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
};

// Get all doctors (for patient booking)
const getAllDoctors = async (req, res) => {
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
};

// Get doctors by department
const getDoctorsByDepartment = async (req, res) => {
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
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPrescription,
  getAllDoctors,
  getDoctorsByDepartment
};