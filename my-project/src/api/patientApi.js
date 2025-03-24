import axios from 'axios';

const API_URL = '/api/patients';

// Config with token
const getConfig = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return {
    headers: {
      Authorization: `Bearer ${userInfo.token}`
    }
  };
};

// Get patient profile
export const getPatientProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch profile';
  }
};

// Update patient profile
export const updatePatientProfile = async (patientData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, patientData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update profile';
  }
};

// Book appointment
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(`${API_URL}/appointment`, appointmentData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to book appointment';
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_URL}/payment/verify`, paymentData, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Payment verification failed';
  }
};

// Get patient appointments
export const getPatientAppointments = async () => {
  try {
    const response = await axios.get(`${API_URL}/appointments`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch appointments';
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await axios.put(`${API_URL}/appointment/${appointmentId}/cancel`, {}, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to cancel appointment';
  }
};

// Generate bill
export const generateBill = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_URL}/bill/${appointmentId}`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to generate bill';
  }
};