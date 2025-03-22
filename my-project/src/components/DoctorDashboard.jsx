import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDoctorProfile, getDoctorAppointments, updateAppointmentStatus } from '../api/doctorApi';

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [prescriptionModal, setPrescriptionModal] = useState({
    isOpen: false,
    appointmentId: null,
    medications: '',
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const doctorData = await getDoctorProfile();
        setDoctor(doctorData);
        
        const appointmentsData = await getDoctorAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status } : app
      ));
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to update appointment status`);
      console.error(error);
    }
  };

  const handleAddPrescription = async () => {
    try {
      const { appointmentId, medications, notes, followUpDate } = prescriptionModal;
      
      if (!medications.trim()) {
        toast.error('Please add at least one medication');
        return;
      }
      
      // Call API to add prescription
      const response = await fetch(`/api/doctors/appointment/prescription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          appointmentId,
          medications: medications.split('\n').filter(med => med.trim() !== ''),
          notes,
          followUpDate: followUpDate || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add prescription');
      }
      
      const updatedAppointment = await response.json();
      
      // Update the appointment in the state
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, prescription: updatedAppointment.prescription } : app
      ));
      
      // Close modal and reset form
      setPrescriptionModal({
        isOpen: false,
        appointmentId: null,
        medications: '',
        notes: '',
        followUpDate: ''
      });
      
      toast.success('Prescription added successfully');
    } catch (error) {
      toast.error('Failed to add prescription');
      console.error(error);
    }
  };

  const openPrescriptionModal = (appointmentId) => {
    setPrescriptionModal({
      isOpen: true,
      appointmentId,
      medications: '',
      notes: '',
      followUpDate: ''
    });
  };

  const filterAppointments = () => {
    if (activeTab === 'upcoming') {
      return appointments.filter(app => 
        ['Pending', 'Confirmed'].includes(app.status) && 
        new Date(app.appointmentDate) >= new Date()
      );
    } else if (activeTab === 'past') {
      return appointments.filter(app => 
        app.status === 'Completed' || 
        new Date(app.appointmentDate) < new Date()
      );
    } else if (activeTab === 'cancelled') {
      return appointments.filter(app => app.status === 'Cancelled');
    }
    return appointments;
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
      <h1 className="text-3xl font-bold text-primary-700 mb-8">Doctor Dashboard</h1>
      
      {/* Doctor Profile Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Dr. {doctor?.name}</h2>
            <p className="text-gray-600">{doctor?.department}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Specialization</p>
            <p className="font-medium">{doctor?.specialization?.join(', ') || 'Not specified'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Experience</p>
            <p className="font-medium">{doctor?.experience} years</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="font-medium">₹{doctor?.fee}</p>
          </div>
        </div>
        
      
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'past'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Appointments
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`mr-8 py-4 px-1 ${
              activeTab === 'cancelled'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>
      
      {/* Appointments Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {filterAppointments().length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">No {activeTab} appointments found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
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
              {filterAppointments().map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient.age} years, {appointment.patient.gender}
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {appointment.problem}
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
                    {appointment.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'Confirmed')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Confirm
                      </button>
                    )}
                    {appointment.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(appointment._id, 'Completed')}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Complete
                      </button>
                    )}
                    {(appointment.status === 'Confirmed' || appointment.status === 'Completed') && (
                      <button
                        onClick={() => openPrescriptionModal(appointment._id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {appointment.prescription ? 'Update Prescription' : 'Add Prescription'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Prescription Modal */}
      {prescriptionModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Prescription</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Medications (One per line)
              </label>
              <textarea
                rows="4"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                placeholder="e.g. Paracetamol 500mg - 1 tablet every 8 hours"
                value={prescriptionModal.medications}
                onChange={(e) => setPrescriptionModal({...prescriptionModal, medications: e.target.value})}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                rows="3"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                placeholder="Any additional notes for the patient"
                value={prescriptionModal.notes}
                onChange={(e) => setPrescriptionModal({...prescriptionModal, notes: e.target.value})}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Follow-up Date (Optional)
              </label>
              <input
                type="date"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                value={prescriptionModal.followUpDate}
                onChange={(e) => setPrescriptionModal({...prescriptionModal, followUpDate: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                onClick={() => setPrescriptionModal({...prescriptionModal, isOpen: false})}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleAddPrescription}
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}