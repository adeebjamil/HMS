import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../api/authApi';
import DoctorDashboard from '../components/DoctorDashboard';
import DoctorProfile from '../components/DoctorProfile';
import DoctorSidebar from '../components/DoctorSidebar';

export default function DoctorDashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { userInfo, userType } = getCurrentUser();

  // Redirect if not logged in as doctor
  if (!userInfo || userType !== 'doctor') {
    return <Navigate to="/doctor" />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DoctorDashboard />;
      case 'appointments':
        return <DoctorDashboard activeTab="upcoming" />;
      case 'patients':
        return <DoctorDashboard activeTab="patients" />;
      case 'profile':
        return <DoctorProfile />;
      case 'settings':
        return <DoctorProfile isSettings={true} />;
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar */}
      <DoctorSidebar activePage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary-800">
                Welcome, Dr. {userInfo.name}
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