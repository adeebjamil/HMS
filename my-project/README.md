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












































import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatientProfile, getPatientAppointments, cancelAppointment } from '../api/patientApi';
import { toast } from 'react-toastify';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await getPatientProfile();
        setPatient(patientData);
        
        const appointmentsData = await getPatientAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId);
        // Update appointments list after cancellation
        setAppointments(appointments.map(app => 
          app._id === appointmentId ? { ...app, status: 'Cancelled' } : app
        ));
        toast.success('Appointment cancelled successfully');
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const generateBillLink = (appointmentId) => {
    return `/patient/bill/${appointmentId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-8">Patient Dashboard</h1>
      
      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{patient?.name}</h2>
            <p className="text-gray-600">{patient?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Age</p>
            <p className="font-medium">{patient?.age} years</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{patient?.gender}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Blood Group</p>
            <p className="font-medium">{patient?.bloodGroup || 'Not specified'}</p>
          </div>
        </div>
        
        
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'appointments'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('medicalHistory')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'medicalHistory'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medical History
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'appointments' && (
        <div>
          <div className="flex justify-end mb-4">
           
          </div>
          
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">You don't have any appointments yet.</p>
              <p className="mt-2 text-gray-500">Book an appointment to get started!</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            Cancel
                          </button>
                        )}
                        {appointment.status === 'Confirmed' || appointment.status === 'Completed' ? (
                          <Link 
                            to={generateBillLink(appointment._id)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Bill
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'medicalHistory' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Medical History</h3>
          
          {patient?.medicalHistory && patient.medicalHistory.length > 0 ? (
            <ul className="space-y-3">
              {patient.medicalHistory.map((item, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-md">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No medical history records available.</p>
          )}
          
          <div className="mt-8">
            <h4 className="text-lg font-medium mb-3">Allergies</h4>
            {patient?.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No allergies recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}























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
        return <PatientDashboard />;
      case 'booking':
        return <Booking onBookingComplete={handleBookingComplete} />;
      case 'payment':
        if (!bookingData) return <Navigate to="/patient/dashboard" />;
        return <Payment bookingData={bookingData} onPaymentComplete={handlePaymentComplete} />;
      case 'profile':
        return <PatientProfile />;
      case 'history':
        return <PatientDashboard activeTab="medicalHistory" />;
      case 'payments':
        return <PaymentHistory />;
      default:
        return <PatientDashboard />;
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