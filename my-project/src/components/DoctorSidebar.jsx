import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Add setCurrentPage prop
export default function DoctorSidebar({ activePage, setCurrentPage }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add effect to fetch pending referrals count
  useEffect(() => {
    const fetchPendingReferrals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || 
                    (localStorage.getItem('userInfo') ? 
                      JSON.parse(localStorage.getItem('userInfo')).token : '');
        
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get('/api/doctors/referrals/received', config);
        
        // Count pending referrals
        let pendingCount = 0;
        if (Array.isArray(response.data)) {
          pendingCount = response.data.filter(ref => ref.status === 'pending').length;
        } else if (response.data && Array.isArray(response.data.referrals)) {
          pendingCount = response.data.referrals.filter(ref => ref.status === 'pending').length;
        }
        
        setPendingReferrals(pendingCount);
      } catch (error) {
        console.error('Error fetching pending referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingReferrals();
  }, []);

  // Update the handleLogout function to ensure complete logout
  const handleLogout = () => {
    console.log('Logging out user...');
    
    // Clear all possible auth data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    
    // Use a more forceful approach to ensure navigation works
    try {
      // First attempt - use navigate with replace to clear history
      navigate('/doctor', { replace: true });
      
      // Second approach - after short delay, use window.location for a full page refresh
      setTimeout(() => {
        console.log('Forcing page refresh to ensure logout');
        window.location.href = '/doctor';
      }, 100);
    } catch (error) {
      console.error('Navigation error during logout:', error);
      // Fallback direct approach
      window.location.href = '/doctor';
    }
  };

  // Update the handleMenuClick function
  const handleMenuClick = (page) => {
    console.log('Sidebar menu clicked:', page);
    
    // For dedicated routes, use direct navigation
    if (page === 'dashboard') {
      navigate('/doctor/dashboard');
    } else {
      // For components rendered within the dashboard (including referrals now)
      if (setCurrentPage) {
        console.log('Directly setting currentPage to:', page);
        setCurrentPage(page);
      }
      navigate('/doctor/dashboard', { state: { activePage: page } });
    }
  };

  return (
    <div className={`h-screen bg-white shadow-lg flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Header with logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h1 className="text-xl font-bold text-primary-700">Doctor Portal</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-full hover:bg-gray-100">
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <button
              onClick={() => handleMenuClick('dashboard')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {!collapsed && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('appointments')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'appointments' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span>Appointments</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('patients')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'patients' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {!collapsed && <span>My Patients</span>}
            </button>
          </li>
          {/* New Doctors menu item */}
          <li>
            <button
              onClick={() => handleMenuClick('doctors')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'doctors' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {!collapsed && <span>Doctors</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('referrals')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'referrals' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {!collapsed && <span>Referral Messages</span>}
              {!collapsed && pendingReferrals > 0 && (
                <span className="ml-2 text-sm text-red-500">({pendingReferrals} pending)</span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('reports')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'reports' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!collapsed && <span>Reports</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('profile')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'profile' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!collapsed && <span>My Profile</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleMenuClick('settings')}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activePage === 'settings' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!collapsed && <span>Settings</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 w-full text-left rounded-lg text-red-600 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}