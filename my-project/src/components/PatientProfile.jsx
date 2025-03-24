import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPatientProfile, updatePatientProfile } from '../api/patientApi';

export default function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bloodGroup: '',
    medicalHistory: [],
    allergies: [],
    phoneNumber: '',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getPatientProfile();
        setProfile({
          ...data,
          medicalHistory: data.medicalHistory?.join(', ') || '',
          allergies: data.allergies?.join(', ') || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value
        }
      });
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
      // Convert string lists back to arrays
      const updatedProfile = {
        ...profile,
        medicalHistory: profile.medicalHistory ? profile.medicalHistory.split(',').map(item => item.trim()) : [],
        allergies: profile.allergies ? profile.allergies.split(',').map(item => item.trim()) : []
      };
      
      await updatePatientProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">Patient Profile</h2>
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
            <label className="block text-secondary-700 mb-2">Age</label>
            {isEditing ? (
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className="input-field"
              />
            ) : (
              <p className="py-2">{profile.age}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="py-2">{profile.gender}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-secondary-700 mb-2">Blood Group</label>
            {isEditing ? (
              <select
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="py-2">{profile.bloodGroup || 'Not specified'}</p>
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
            <label className="block text-secondary-700 mb-2">Medical History (comma separated)</label>
            {isEditing ? (
              <textarea
                name="medicalHistory"
                value={profile.medicalHistory || ''}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="e.g. Diabetes, Hypertension"
              ></textarea>
            ) : (
              <p className="py-2">
                {profile.medicalHistory && profile.medicalHistory.length > 0
                  ? typeof profile.medicalHistory === 'string'
                    ? profile.medicalHistory
                    : profile.medicalHistory.join(', ')
                  : 'None'}
              </p>
            )}
          </div>

          <div className="md:col-span-2 mb-4">
            <label className="block text-secondary-700 mb-2">Allergies (comma separated)</label>
            {isEditing ? (
              <textarea
                name="allergies"
                value={profile.allergies || ''}
                onChange={handleChange}
                className="input-field"
                rows="2"
                placeholder="e.g. Penicillin, Peanuts"
              ></textarea>
            ) : (
              <p className="py-2">
                {profile.allergies && profile.allergies.length > 0
                  ? typeof profile.allergies === 'string'
                    ? profile.allergies
                    : profile.allergies.join(', ')
                  : 'None'}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-secondary-700 mb-2">Emergency Contact</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-secondary-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={profile.emergencyContact?.name || ''}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="py-2">{profile.emergencyContact?.name || 'Not specified'}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-secondary-700 mb-2">Relationship</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={profile.emergencyContact?.relationship || ''}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="py-2">{profile.emergencyContact?.relationship || 'Not specified'}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-secondary-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContact.phoneNumber"
                    value={profile.emergencyContact?.phoneNumber || ''}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="py-2">{profile.emergencyContact?.phoneNumber || 'Not specified'}</p>
                )}
              </div>
            </div>
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