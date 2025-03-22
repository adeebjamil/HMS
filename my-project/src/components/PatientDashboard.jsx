import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatientProfile, getPatientAppointments, cancelAppointment } from '../api/patientApi';
import { toast } from 'react-toastify';

export default function PatientDashboard({ activeTab = 'overview' }) {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    // Update the active tab when the prop changes
    setCurrentTab(activeTab);
  }, [activeTab]);

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

  // Show different content based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <p className="text-gray-600 mb-6">Welcome to your patient dashboard. Here's a summary of your recent activity.</p>
            
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Upcoming Appointments</h4>
                <p className="text-2xl font-bold text-blue-800">
                  {appointments.filter(app => 
                    ['Pending', 'Confirmed'].includes(app.status) &&
                    new Date(app.appointmentDate) >= new Date()
                  ).length}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="text-sm font-medium text-green-700 mb-2">Completed Appointments</h4>
                <p className="text-2xl font-bold text-green-800">
                  {appointments.filter(app => app.status === 'Completed').length}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="text-sm font-medium text-purple-700 mb-2">Active Prescriptions</h4>
                <p className="text-2xl font-bold text-purple-800">
                  {appointments.filter(app => app.prescription).length}
                </p>
              </div>
            </div>
            
            {/* Next appointment */}
            <h3 className="text-lg font-semibold mb-3">Next Appointment</h3>
            {(() => {
              const nextAppointment = appointments
                .filter(app => ['Pending', 'Confirmed'].includes(app.status) && new Date(app.appointmentDate) >= new Date())
                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
                
              if (nextAppointment) {
                return (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Dr. {nextAppointment.doctor.name}</p>
                        <p className="text-sm text-gray-600">{nextAppointment.doctor.department}</p>
                        <p className="text-sm mt-2">
                          {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at {nextAppointment.timeSlot}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${nextAppointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {nextAppointment.status}
                      </span>
                    </div>
                  </div>
                );
              } else {
                return <p className="text-gray-500">No upcoming appointments.</p>;
              }
            })()}
          </div>
        );
        
      case 'appointments':
        return (
          <div>
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
        );
        
      case 'medicalHistory':
        return (
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
        );
        
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-8">Patient Dashboard</h1>
      
      {/* Profile Summary - Always show on all pages */}
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
      
      {/* Content section */}
      {renderContent()}
    </div>
  );
}