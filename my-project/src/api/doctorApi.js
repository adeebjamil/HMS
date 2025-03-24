import axios from 'axios';

const API_URL = '/api/doctors';

// Config with token
const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
};

// Get doctor profile
export const getDoctorProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch profile';
  }
};

// Update doctor profile
export const updateDoctorProfile = async (doctorData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, doctorData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update profile';
  }
};

// Get doctor appointments
export const getDoctorAppointments = async () => {
  try {
    const response = await axios.get(`${API_URL}/appointments`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch appointments';
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axios.put(`${API_URL}/appointment/status`, {
      appointmentId,
      status
    }, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update appointment status';
  }
};

// Add prescription
export const addPrescription = async (appointmentId, prescriptionData) => {
  try {
    const response = await axios.post(`${API_URL}/appointment/prescription`, {
      appointmentId,
      ...prescriptionData
    }, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to add prescription';
  }
};

// Get all doctors (no auth required)
export const getAllDoctors = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch doctors';
  }
};

// Get doctors by department (no auth required)
export const getDoctorsByDepartment = async (department) => {
  try {
    const response = await axios.get(`${API_URL}/department/${department}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch doctors';
  }
};

// Get doctor patients
export const getDoctorPatients = async () => {
  try {
    // The correct endpoint is 'doctor/patients'
    const response = await axios.get(`${API_URL}/patients`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw new Error('Failed to fetch patients');
  }
};

// Refer patient to another doctor
export const referPatientToDoctor = async (patientId, doctorId, notes) => {
  try {
    const response = await axios.post(`${API_URL}/refer`, {
      patientId,
      doctorId,
      notes
    }, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error referring patient:', error);
    throw error.response?.data?.error || 'Failed to refer patient';
  }
};