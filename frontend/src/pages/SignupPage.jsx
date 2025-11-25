import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, Building2 } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    hospital_name: '',
    role: 'hospital' // Default to hospital for public signup
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Join the Medicinna network</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Hospital Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                name="hospital_name"
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.hospital_name}
                onChange={handleChange}
                required
                placeholder="e.g. City General"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;