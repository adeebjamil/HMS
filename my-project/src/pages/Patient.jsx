import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import { getCurrentUser } from '../api/authApi';

export default function Patient() {
  const [activeTab, setActiveTab] = useState('login');
  const { userInfo, userType } = getCurrentUser();

  // Redirect to dashboard if already logged in as patient
  if (userInfo && userType === 'patient') {
    return <Navigate to="/patient/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-primary-800 mb-4">Patient Portal</h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Welcome to the patient portal. Please login to your account or register to access our healthcare services.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'login'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-secondary-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'register'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-secondary-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'login' ? (
              <Login userType="patient" />
            ) : (
              <Register userType="patient" />
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-secondary-600">
            Are you a doctor?{' '}
            <Link to="/doctor" className="text-primary-600 hover:underline font-medium">
              Go to Doctor Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}