import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerDoctor, registerPatient } from '../api/authApi';

export default function Register({ userType }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    // Patient specific fields
    age: '',
    gender: 'Male',
    // Doctor specific fields
    department: '',
    specialization: '',
    fee: '',
  });

  const { name, email, password, confirmPassword, phoneNumber, age, gender, department, specialization, fee } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      if (userType === 'doctor') {
        // Register as doctor
        if (!department || !fee) {
          return toast.error('Please fill all required fields');
        }
        
        await registerDoctor({
          name,
          email,
          password,
          department,
          specialization: specialization.split(',').map(spec => spec.trim()),
          fee: Number(fee),
          phoneNumber
        });
        
        toast.success('Registration successful! Welcome Doctor.');
        navigate('/doctor/dashboard');
      } else {
        // Register as patient
        if (!age || !gender) {
          return toast.error('Please fill all required fields');
        }
        
        await registerPatient({
          name,
          email,
          password,
          age: Number(age),
          gender,
          phoneNumber
        });
        
        toast.success('Registration successful!');
        navigate('/patient/dashboard');
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 card">
      <h2 className="section-title text-center">Register as {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2" htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-secondary-700 mb-2" htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
        
        {userType === 'patient' ? (
          <>
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2" htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={age}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2" htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={onChange}
                className="input-field"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2" htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={onChange}
                className="input-field"
                required
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
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2" htmlFor="specialization">
                Specialization (comma separated)
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={specialization}
                onChange={onChange}
                className="input-field"
                placeholder="e.g. Heart Surgery, Cardiac Rehabilitation"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-secondary-700 mb-2" htmlFor="fee">Consultation Fee</label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={fee}
                onChange={onChange}
                className="input-field"
                required
              />
            </div>
          </>
        )}
        
        <button type="submit" className="btn-primary w-full mt-4">
          Register
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-secondary-600">
          Already have an account?{' '}
          <button 
            onClick={() => navigate(`/${userType.toLowerCase()}`)}
            className="text-primary-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}