# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
















import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/authApi';
import PatientDashboard from '../components/PatientDashboard';
import PatientProfile from '../components/PatientProfile';
import Booking from '../components/Booking';
import { toast } from 'react-toastify';

export default function PatientDashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [bookingData, setBookingData] = useState(null);
  const { userInfo, userType } = getCurrentUser();

  // Redirect if not logged in as patient
  if (!userInfo || userType !== 'patient') {
    return <Navigate to="/patient" />;
  }

  const handleBookingComplete = (data) => {
    setBookingData(data);
    setCurrentPage('payment');
  };

  const handlePaymentComplete = () => {
    setBookingData(null);
    setCurrentPage('dashboard');
    toast.success('Appointment booked successfully!');
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PatientDashboard />;
      case 'booking':
        return <Booking onBookingComplete={handleBookingComplete} />;
      case 'payment':
        if (!bookingData) return <Navigate to="/patient/dashboard" />;
        return <Payment bookingData={bookingData} onPaymentComplete={handlePaymentComplete} />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <h1 className="text-xl font-bold text-primary-800">Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-secondary-600">Welcome, {userInfo.name}</span>
              <button
                onClick={handleLogout}
                className="text-secondary-600 hover:text-secondary-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <nav className="bg-white shadow-md rounded-lg p-4 mb-8">
          <ul className="flex space-x-6">
            <li>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`py-2 px-1 font-medium border-b-2 ${
                  currentPage === 'dashboard'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-secondary-500 border-transparent hover:text-secondary-800'
                }`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('booking')}
                className={`py-2 px-1 font-medium border-b-2 ${
                  currentPage === 'booking'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-secondary-500 border-transparent hover:text-secondary-800'
                }`}
              >
                Book Appointment
              </button>
            </li>
          </ul>
        </nav>

        {renderPage()}
      </div>
    </div>
  );
}