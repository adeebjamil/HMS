import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/authApi';
import PatientDashboard from '../components/PatientDashboard';
import PatientProfile from '../components/PatientProfile';
import Booking from '../components/Booking';
import Payment from '../components/Payment';
import PaymentHistory from '../components/PaymentHistory';
import PatientSidebar from '../components/PatientSidebar';
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PatientDashboard activeTab="overview" />;
      case 'appointments':
        return <PatientDashboard activeTab="appointments" />;
      case 'booking':
        return <Booking onBookingComplete={handleBookingComplete} />;
      case 'payment':
        if (!bookingData) return <Navigate to="/patient/dashboard" />;
        return <Payment bookingData={bookingData} onPaymentComplete={handlePaymentComplete} />;
      case 'history':
        return <PatientDashboard activeTab="medicalHistory" />;
      case 'payments':
        return <PaymentHistory />;
      case 'profile':
        return <PatientProfile />;
      default:
        return <PatientDashboard activeTab="overview" />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar */}
      <PatientSidebar activePage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary-800">
                Welcome, {userInfo.name}
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}