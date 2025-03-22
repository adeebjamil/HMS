import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function DoctortoDoctor() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [referralDate, setReferralDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentReferrals, setRecentReferrals] = useState([]);

  // Fetch patients and doctors when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set default referral date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setReferralDate(tomorrow.toISOString().split('T')[0]);
        
        // Get API configuration with token
        const getConfig = () => {
          // Try both token storage methods
          const token = localStorage.getItem('token') || 
                        (localStorage.getItem('userInfo') ? 
                          JSON.parse(localStorage.getItem('userInfo')).token : '');
          
          console.log("Using auth token:", token ? "Token found" : "No token!");
          
          return {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          };
        };
        
        // Fetch patients - try multiple endpoints
        let patientsData = [];
        let patientsSuccess = false;
        
        // Try first endpoint
        try {
          const response = await axios.get('/api/doctors/patients', getConfig());
          patientsData = response.data;
          console.log('Patients data from /api/doctors/patients:', patientsData);
          patientsSuccess = true;
        } catch (error) {
          console.log('First patient endpoint failed, trying alternative...');
          
          // Try second endpoint
          try {
            const response = await axios.get('/api/patients', getConfig());
            patientsData = response.data;
            console.log('Patients data from /api/patients:', patientsData);
            patientsSuccess = true;
          } catch (secondError) {
            // Try third endpoint
            try {
              const response = await axios.get('/api/doctor/patients', getConfig());
              patientsData = response.data;
              console.log('Patients data from /api/doctor/patients:', patientsData);
              patientsSuccess = true;
            } catch (thirdError) {
              console.error('All patient endpoints failed:', error, secondError, thirdError);
              toast.error('Could not fetch patients. Please check your network connection.');
            }
          }
        }
        
        // Fetch doctors - try multiple endpoints
        let doctorsData = [];
        let doctorsSuccess = false;
        
        // Fetch doctors directly using the working endpoint
        try {
          const response = await axios.get('/api/doctors/all', getConfig());
          doctorsData = response.data;
          console.log('Doctors data:', doctorsData);
          doctorsSuccess = true;
          
          if (Array.isArray(doctorsData) && doctorsData.length > 0) {
            console.log(`Successfully fetched ${doctorsData.length} doctors`);
          } else {
            console.warn('Doctors data is not in expected format:', doctorsData);
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
          toast.error('Could not fetch doctors. Please check your network connection.');
        }
        
        // Update state with fetched data
        if (patientsSuccess) {
          setPatients(Array.isArray(patientsData) ? patientsData : []);
        }
        
        // Replace the doctor data processing section with this improved version:
        if (doctorsSuccess) {
          try {
            // Log the full doctors data for debugging
            console.log('Raw doctors data:', doctorsData);
            
            // Make sure doctorsData is always an array
            let doctorsArray = [];
            
            if (Array.isArray(doctorsData)) {
              doctorsArray = doctorsData;
              console.log(`Received array of ${doctorsArray.length} doctors`);
            } else if (doctorsData && typeof doctorsData === 'object') {
              // Handle response with a data property
              if (doctorsData.data && Array.isArray(doctorsData.data)) {
                doctorsArray = doctorsData.data;
                console.log(`Extracted array of ${doctorsArray.length} doctors from data property`);
              } else if (doctorsData.doctors && Array.isArray(doctorsData.doctors)) {
                // Some APIs nest data under a 'doctors' property
                doctorsArray = doctorsData.doctors;
                console.log(`Extracted array of ${doctorsArray.length} doctors from doctors property`);
              } else {
                // If it's just a single doctor object, wrap it in an array
                doctorsArray = Object.prototype.toString.call(doctorsData) === '[object Object]' ? [doctorsData] : [];
                console.log(`Converted single doctor object to array, length: ${doctorsArray.length}`);
              }
            }
            
            if (doctorsArray.length === 0) {
              console.warn('No doctors found in the response');
            }
            
            // Process each doctor to ensure required fields exist
            const processedDoctors = doctorsArray.map(doctor => {
              if (!doctor) return null;
              
              try {
                return {
                  _id: doctor._id || doctor.id || `unknown-${Math.random().toString(36).substr(2, 9)}`,
                  name: doctor.name || doctor.doctorName || 'Unknown Doctor',
                  specialization: Array.isArray(doctor.specialization) 
                    ? doctor.specialization 
                    : (typeof doctor.specialization === 'string' 
                        ? [doctor.specialization] 
                        : (doctor.department ? [doctor.department] : ['General']))
                };
              } catch (err) {
                console.error('Error processing doctor:', err, doctor);
                return null;
              }
            }).filter(Boolean); // Remove any null entries
            
            console.log('Processed doctors array - ALL DOCTORS:', processedDoctors);
            
            // IMPORTANT: No filtering - use ALL doctors
            setDoctors(processedDoctors);
            
          } catch (error) {
            console.error('Error processing doctor data:', error);
            toast.error('There was a problem processing doctor data');
            setDoctors([]); // Set empty array on error
          }
        }

        // Fetch recent referrals
        try {
          const referralsResponse = await axios.get('/api/doctors/referrals/sent', getConfig());
          console.log('Recent referrals:', referralsResponse.data);
          setRecentReferrals(Array.isArray(referralsResponse.data) ? referralsResponse.data : []);
        } catch (error) {
          console.error('Error fetching recent referrals:', error);
          // Non-critical, so just log it without showing toast
        }

      } catch (error) {
        console.error('Error in setup:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simplify the form submission to use the correct endpoint we just added

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedPatient || !selectedDoctor || !referralDate) {
    toast.error('Please fill all required fields');
    return;
  }
  
  try {
    setSubmitting(true);
    
    // Get authentication token
    const token = localStorage.getItem('token') || 
                 (localStorage.getItem('userInfo') ? 
                   JSON.parse(localStorage.getItem('userInfo')).token : '');
    
    if (!token) {
      toast.error('Authentication error. Please log in again.');
      return;
    }
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    
    // Create referral data
    const referralData = {
      patientId: selectedPatient,
      doctorId: selectedDoctor,
      referralDate,
      notes
    };
    
    console.log('Sending referral with data:', referralData);
    
    // Send to our new endpoint
    const response = await axios.post('/api/doctors/refer', referralData, config);
    
    console.log('Referral created successfully:', response.data);
    toast.success('Patient successfully referred to doctor');
    
    // Add the new referral to the recent referrals list
    setRecentReferrals(prev => [response.data, ...prev]);
    
    // Reset form
    setSelectedPatient('');
    setSelectedDoctor('');
    setNotes('');
    setReferralDate(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    });
    
  } catch (error) {
    console.error('Error creating referral:', error);
    toast.error('Failed to refer patient: ' + 
      (error.response?.data?.error || error.message || 'Unknown error'));
  } finally {
    setSubmitting(false);
  }
};

  // Get API configuration with token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">Refer Patient to Another Doctor</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">
          Use this form to refer a patient to another doctor for specialized care or consultation.
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Select Patient Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="patient">
              Select Patient *
            </label>
            <select
              id="patient"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              required
            >
              <option value="">-- Select a patient --</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.gender}, {patient.age} years)
                </option>
              ))}
            </select>
          </div>
          
          {/* Select Doctor Dropdown - improved version */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="doctor">
              Refer to Doctor * ({doctors.length} available)
            </label>
            <select
              id="doctor"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
            >
              <option value="">-- Select a doctor ({doctors.length} available) --</option>
              {doctors.length > 0 ? (
                doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization && doctor.specialization[0] ? doctor.specialization[0] : 'General Practitioner'}
                  </option>
                ))
              ) : (
                <option value="" disabled>No other doctors available</option>
              )}
            </select>
            {doctors.length === 0 && (
              <p className="mt-2 text-red-500 text-sm">
                No doctors found. Please check your connection or contact support.
              </p>
            )}
          </div>
          
          {/* Referral Date */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="referralDate">
              Referral Date *
            </label>
            <input
              id="referralDate"
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              value={referralDate}
              onChange={(e) => setReferralDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Can't select past dates
              required
            />
          </div>
          
          {/* Referral Notes */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Reason for Referral
            </label>
            <textarea
              id="notes"
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Please explain why you are referring this patient..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selectedPatient || !selectedDoctor || !referralDate}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                submitting || !selectedPatient || !selectedDoctor || !referralDate
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Send Referral'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Recently Referred Patients Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-primary-700 mb-4">Recent Referrals</h2>
        
        {recentReferrals.length > 0 ? (
          <div className="space-y-4">
            {recentReferrals.map(referral => (
              <div key={referral._id} className="border-l-4 border-primary-500 pl-4 py-2">
                <p className="font-medium text-gray-800">
                  {referral.patient?.name} → Dr. {referral.toDoctor?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Referral Date: {new Date(referral.referralDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Status: <span className={
                    referral.status === 'accepted' ? 'text-green-600' :
                    referral.status === 'declined' ? 'text-red-600' : 'text-yellow-600'
                  }>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 italic">
            No recent referrals found. Referrals you make will appear here.
          </p>
        )}
      </div>
    </div>
  );
}