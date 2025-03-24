import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllDoctors, getDoctorsByDepartment } from '../api/doctorApi';
import { bookAppointment } from '../api/patientApi';

export default function Booking({ onBookingComplete }) {
  const [departments, setDepartments] = useState([
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Psychiatry', 'Oncology', 'General Medicine'
  ]);
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [problem, setProblem] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctorsByDepartment(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedDoctor) {
      generateTimeSlots();
    }
  }, [selectedDoctor, appointmentDate]);

  const fetchDoctorsByDepartment = async (department) => {
    setLoading(true);
    try {
      const data = await getDoctorsByDepartment(department);
      setDoctors(data);
      setSelectedDoctor(null);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setTimeSlot('');
  };

  const generateTimeSlots = () => {
    if (!selectedDoctor || !selectedDoctor.availability) {
      setAvailableSlots([]);
      return;
    }
    
    const selectedDay = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find availability for the selected day
    const dayAvailability = selectedDoctor.availability.filter(slot => 
      slot.day.toLowerCase() === selectedDay.toLowerCase()
    );
    
    if (dayAvailability.length === 0) {
      setAvailableSlots([]);
      return;
    }
    
    // Generate slots based on doctor's availability
    const slots = [];
    dayAvailability.forEach(availability => {
      const startTime = convertTo24Hour(availability.startTime);
      const endTime = convertTo24Hour(availability.endTime);
      
      // Generate 1-hour slots
      let currentHour = startTime;
      while (currentHour < endTime) {
        const slotStart = formatTime(currentHour);
        const slotEnd = formatTime(currentHour + 1 > 24 ? 24 : currentHour + 1);
        slots.push(`${slotStart} - ${slotEnd}`);
        currentHour += 1;
      }
    });
    
    setAvailableSlots(slots);
  };

  // Helper functions for time conversion
  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(/\s|:/);
    let hours = parseInt(time, 10);
    
    if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    }
    if (modifier && modifier.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours;
  };

  const formatTime = (hour) => {
    if (hour === 0 || hour === 24) {
      return '12:00 AM';
    } else if (hour === 12) {
      return '12:00 PM';
    } else if (hour < 12) {
      return `${hour}:00 AM`;
    } else {
      return `${hour - 12}:00 PM`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !timeSlot || !problem) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      const bookingData = {
        doctorId: selectedDoctor._id,
        appointmentDate,
        timeSlot,
        problem
      };
      
      const response = await bookAppointment(bookingData);
      onBookingComplete(response);
      toast.success('Appointment booked successfully. Proceed to payment.');
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">Book an Appointment</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2">Select Department</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        {selectedDepartment && (
          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Select Doctor</label>
            {loading ? (
              <p>Loading doctors...</p>
            ) : doctors.length > 0 ? (
              <div className="space-y-2">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`p-4 border rounded-md cursor-pointer hover:bg-secondary-100 transition ${
                      selectedDoctor?._id === doctor._id ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-secondary-600 text-sm mt-1">
                      {doctor.specialization?.join(', ')}
                    </div>
                    <div className="text-secondary-500 text-sm mt-1">
                      Experience: {doctor.experience || 0} years
                    </div>
                    <div className="text-primary-600 font-medium mt-1">
                      Fee: ₹{doctor.fee}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No doctors available in this department</p>
            )}
          </div>
        )}
        
        {selectedDoctor && (
          <>
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2">Select Date</label>
              <DatePicker
                selected={appointmentDate}
                onChange={(date) => setAppointmentDate(date)}
                minDate={new Date()}
                className="input-field"
                dateFormat="MMMM d, yyyy"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2">Select Time Slot</label>
              {availableSlots.length > 0 ? (
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select a time slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              ) : (
                <p className="text-secondary-600">
                  No time slots available for this day. Please select another date.
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2">Describe Your Problem</label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Please describe your symptoms or reason for visit"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full mt-4"
              disabled={!selectedDoctor || !timeSlot || !problem || loading}
            >
              {loading ? 'Processing...' : 'Book Appointment'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}