import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginDoctor, loginPatient } from '../api/authApi';

export default function Login({ userType }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (userType === 'doctor') {
        await loginDoctor(email, password);
        navigate('/doctor/dashboard');
      } else {
        await loginPatient(email, password);
        navigate('/patient/dashboard');
      }
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 card">
      <h2 className="section-title text-center">Login as {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>
      <form onSubmit={onSubmit}>
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
        
        <button type="submit" className="btn-primary w-full mt-4">
          Login
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-secondary-600">
          Don't have an account?{' '}
          <button 
            onClick={() => navigate(`/${userType.toLowerCase()}/register`)}
            className="text-primary-600 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}