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
import Settings from '../components/Settings';

export default function PatientDashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [bookingData, setBookingData] = useState(null);
  const { userInfo, userType } = getCurrentUser();

  // Redirect if not logged in as patient
  if (!userInfo || userType !== 'patient') {
    return <Navigate to="/patient" />;
  }

  useEffect(() => {
    // Apply saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Use classList to add/remove 'dark' class instead of data-theme attribute
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
      case 'prescriptions':  // Add this case
        return <PatientDashboard activeTab="prescriptions" />;
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
      case 'settings':
        return <Settings />; // Add this case for settings
      default:
        return <PatientDashboard activeTab="overview" />;
    }
  };

  // Update the main background to be less dark
  return (
    <div className="flex h-screen bg-secondary-100 dark:bg-secondary-700">
      {/* Sidebar */}
      <PatientSidebar activePage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-secondary-600 shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary-800 dark:text-primary-200">
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