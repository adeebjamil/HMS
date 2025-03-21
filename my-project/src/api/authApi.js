import axios from 'axios';

const API_URL = '/api/auth';

// Register Doctor
export const registerDoctor = async (doctorData) => {
  try {
    const response = await axios.post(`${API_URL}/register/doctor`, doctorData);
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userType', 'doctor');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

// Register Patient
export const registerPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_URL}/register/patient`, patientData);
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userType', 'patient');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
};

// Login Doctor
export const loginDoctor = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/doctor`, { email, password });
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userType', 'doctor');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

// Login Patient
export const loginPatient = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/patient`, { email, password });
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('userType', 'patient');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Login failed';
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userType');
};

// Get current user
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  const userType = localStorage.getItem('userType');
  
  return {
    userInfo: userInfo ? JSON.parse(userInfo) : null,
    userType
  };
};