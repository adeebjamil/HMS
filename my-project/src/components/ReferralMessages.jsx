import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ReferralMessages() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  useEffect(() => {
    fetchReferrals();
  }, [activeTab]);
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const getConfig = () => {
    const token = localStorage.getItem('token') || 
                 (localStorage.getItem('userInfo') ? 
                   JSON.parse(localStorage.getItem('userInfo')).token : '');
    
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };
  
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      
      // Determine endpoint based on active tab
      const endpoint = activeTab === 'received' 
        ? '/api/doctors/referrals/received'
        : '/api/doctors/referrals/sent';
      
      try {
        const response = await axios.get(endpoint, getConfig());
        console.log(`${activeTab} referrals data:`, response.data);
        
        let referralsData = [];
        if (Array.isArray(response.data)) {
          referralsData = response.data;
        } else if (response.data && Array.isArray(response.data.referrals)) {
          referralsData = response.data.referrals;
        }
        
        // Sort by date (newest first)
        referralsData.sort((a, b) => new Date(b.createdAt || b.referralDate) - new Date(a.createdAt || a.referralDate));
        
        setReferrals(referralsData);
      } catch (error) {
        console.error(`Error fetching ${activeTab} referrals:`, error);
        toast.error(`Could not load ${activeTab} referrals`);
        setReferrals([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleReferralAction = async (referralId, action) => {
    try {
      const response = await axios.put(
        `/api/doctors/referrals/${referralId}/${action}`,
        {},
        getConfig()
      );
      
      toast.success(`Referral ${action === 'accept' ? 'accepted' : 'declined'} successfully`);
      fetchReferrals(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing referral:`, error);
      toast.error(`Failed to ${action} referral`);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Filter referrals based on search term
  const filteredReferrals = useMemo(() => {
    if (!searchTerm.trim()) return referrals;
    
    return referrals.filter(referral => {
      const patientName = referral.patient?.name || '';
      return patientName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [referrals, searchTerm]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReferrals.slice(indexOfFirstItem, indexOfLastItem);
  
  // Page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">Referral Messages</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'received'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received Referrals
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'sent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Referrals
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredReferrals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            {searchTerm ? 'No referrals found matching your search.' : `No ${activeTab} referrals found.`}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {currentItems.map((referral) => (
              <div key={referral._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {activeTab === 'received' ? 'From: ' : 'To: '}
                      <span className="text-primary-600">
                        Dr. {referral.fromDoctor?.name || referral.toDoctor?.name || 'Unknown Doctor'}
                      </span>
                    </h2>
                    
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Patient:</span> {referral.patient?.name || 'Unknown Patient'}
                    </p>
                    
                    <p className="text-gray-600">
                      <span className="font-medium">Referral Date:</span> {formatDate(referral.referralDate)}
                    </p>
                    
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`${
                        referral.status === 'accepted' ? 'text-green-600' : 
                        referral.status === 'declined' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </p>
                    
                    {referral.notes && (
                      <div className="mt-3">
                        <h3 className="font-medium text-gray-700">Notes:</h3>
                        <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                          {referral.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {activeTab === 'received' && referral.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReferralAction(referral._id, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReferralAction(referral._id, 'decline')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                Next
              </button>
            </div>
          )}
          
          {/* Page info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReferrals.length)} of {filteredReferrals.length} referrals
          </div>
        </>
      )}
    </div>
  );
}