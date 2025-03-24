import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DoctortoDoctor from '../components/DoctortoDoctor';
import DoctorSidebar from '../components/DoctorSidebar';

export default function DoctortoDoctorPage() {
  const [collapsed, setCollapsed] = useState(false);
  
  // Log that we're in the DoctortoDoctorPage component
  useEffect(() => {
    console.log('Rendering DoctortoDoctorPage');
  }, []);
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/doctor" />;
  }

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar */}
      <DoctorSidebar activePage="doctors" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary-800">
                Doctor Referral System
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          <DoctortoDoctor />
        </main>
      </div>
    </div>
  );
}