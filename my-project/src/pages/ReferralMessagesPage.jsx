import { Navigate } from 'react-router-dom';
import ReferralMessages from '../components/ReferralMessages';
import DoctorSidebar from '../components/DoctorSidebar';

export default function ReferralMessagesPage() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/doctor" />;
  }

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar */}
      <DoctorSidebar activePage="referrals" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary-800">
                Referral Messages
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          <ReferralMessages />
        </main>
      </div>
    </div>
  );
}