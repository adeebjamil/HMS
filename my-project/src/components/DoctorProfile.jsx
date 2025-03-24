import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getDoctorProfile, updateDoctorProfile } from '../api/doctorApi';

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    specialization: [],
    experience: 0,
    fee: 0,
    availability: [],
    bio: '',
    phoneNumber: '',
    address: ''
  });

  const [availabilityInput, setAvailabilityInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getDoctorProfile();
        setProfile({
          ...data,
          specialization: data.specialization?.join(', ') || '',
        });
        formatAvailabilityForDisplay(data.availability);
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const formatAvailabilityForDisplay = (availability) => {
    if (!availability || availability.length === 0) {
      setAvailabilityInput('');
      return;
    }
    
    const formatted = availability.map(slot => 
      `${slot.day} ${slot.startTime}-${slot.endTime}`
    ).join('\n');
    
    setAvailabilityInput(formatted);
  };

  const parseAvailability = (input) => {
    if (!input) return [];
    
    return input.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return null;
      
      const day = parts[0];
      const times = parts[1].split('-');
      
      if (times.length !== 2) return null;
      
      return {
        day,
        startTime: times[0],
        endTime: times[1]
      };
    }).filter(item => item !== null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'availabilityInput') {
      setAvailabilityInput(value);
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string lists back to arrays and parse availability
      const updatedProfile = {
        ...profile,
        specialization: profile.specialization ? profile.specialization.split(',').map(item => item.trim()) : [],
        availability: parseAvailability(availabilityInput)
      };
      
      await updateDoctorProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Doctor Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <p className="py-2">{profile.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Email</label>
            <p className="py-2">{profile.email}</p>
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Department</label>
            {isEditing ? (
              <select
                name="department"
                value={profile.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Oncology">Oncology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            ) : (
              <p className="py-2">{profile.department}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Experience (years)</label>
            {isEditing ? (
              <input
                type="number"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <p className="py-2">{profile.experience} years</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Consultation Fee</label>
            {isEditing ? (
              <input
                type="number"
                name="fee"
                value={profile.fee}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <p className="py-2">₹{profile.fee}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <p className="py-2">{profile.phoneNumber}</p>
            )}
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-secondary-700 mb-2">Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={profile.address || ''}
                onChange={handleChange}
                className="input-field"
                rows="2"
              ></textarea>
            ) : (
              <p className="py-2">{profile.address || 'Not specified'}</p>
            )}
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-secondary-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                className="input-field"
                rows="3"
              ></textarea>
            ) : (
              <p className="py-2">{profile.bio || 'No bio provided'}</p>
            )}
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-secondary-700 mb-2">Specialization (comma separated)</label>
            {isEditing ? (
              <textarea
                name="specialization"
                value={profile.specialization || ''}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="e.g. Heart Surgery, Cardiac Rehabilitation"
              ></textarea>
            ) : (
              <p className="py-2">
                {profile.specialization && profile.specialization.length > 0
                  ? typeof profile.specialization === 'string'
                    ? profile.specialization
                    : profile.specialization.join(', ')
                  : 'None'}
              </p>
            )}
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-secondary-700 mb-2">
              Availability Schedule
              {isEditing && (
                <span className="text-xs text-secondary-500 ml-2">
                  (Format: "Day StartTime-EndTime" e.g., "Monday 09:00-17:00")
                </span>
              )}
            </label>
            {isEditing ? (
              <textarea
                name="availabilityInput"
                value={availabilityInput}
                onChange={handleChange}
                className="input-field"
                rows="5"
                placeholder="Monday 09:00-17:00&#10;Tuesday 10:00-18:00&#10;..."
              ></textarea>
            ) : (
              <div className="py-2">
                {profile.availability && profile.availability.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {profile.availability.map((slot, index) => (
                      <li key={index}>
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No availability set</p>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6">
            <button type="submit" className="btn-primary w-full">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}