import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../api/authApi';
import DoctorDashboard from '../components/DoctorDashboard';
import DoctorProfile from '../components/DoctorProfile';
import DoctorPatients from '../components/DoctorPatients';
import DoctortoDoctor from '../components/DoctortoDoctor';
import DoctorSidebar from '../components/DoctorSidebar';
import ReferralMessages from '../components/ReferralMessages';
import Reports from '../components/Reports';
import Settings from '../components/Settings'; // Import the new Settings component

export default function DoctorDashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { userInfo, userType } = getCurrentUser();
  const location = useLocation();
  
  // Get page from location state when component mounts or location changes
  useEffect(() => {
    console.log('Location state:', location.state);
    if (location.state && location.state.activePage) {
      console.log('Setting current page from location state:', location.state.activePage);
      setCurrentPage(location.state.activePage);
    }
  }, [location]);

  // Redirect if not logged in as doctor
  if (!userInfo || userType !== 'doctor') {
    return <Navigate to="/doctor" />;
  }

  // This console log helps debug the page change
  console.log('Current page in DoctorDashboardPage:', currentPage);

  const renderPage = () => {
    // Add unique key props to force remounting
    console.log('Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'dashboard':
        return <DoctorDashboard key="dashboard-component" activeTab="overview" />;
      case 'appointments':
        return <DoctorDashboard key="appointments-component" activeTab="appointments" />;
      case 'patients':
        return <DoctorPatients key="patients-component" />;
      case 'doctors':
        console.log('Rendering DoctortoDoctor component in dashboard');
        return <DoctortoDoctor key="doctors-component" />;
      case 'referrals':
        console.log('Rendering ReferralMessages component in dashboard');
        return <ReferralMessages key="referrals-component" />;
      case 'reports':
        return <Reports key="reports-component" />;
      case 'profile':
        return <DoctorProfile key="profile-component" />;
      case 'settings':
        // Use the new dedicated Settings component instead of DoctorProfile with isSettings=true
        return <Settings key="settings-component" />;
      default:
        return <DoctorDashboard key="default-component" activeTab="overview" />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar - Pass setCurrentPage to allow direct component switching */}
      <DoctorSidebar 
        activePage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      
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