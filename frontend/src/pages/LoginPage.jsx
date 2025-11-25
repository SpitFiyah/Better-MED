import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Activity, AlertTriangle, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      if (role === 'admin') navigate('/admin');
      else navigate('/dashboard'); // Unified dashboard route
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-primary">
      {/* Left Side: Login Form */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-16 border-r-2 border-neu-border">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-accent border-2 border-neu-border p-2 rounded-lg shadow-neu-dark">
              <Activity className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-4xl font-black text-primary tracking-tight">Medicinna</h1>
          </div>
          
          <div className="neu-card-dark p-8 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-secondary text-background text-xs font-bold px-3 py-1 border-l-2 border-b-2 border-neu-border">
              SECURE ACCESS
            </div>
            
            <h2 className="text-2xl font-black text-primary mb-2">Welcome Back</h2>
            <p className="text-gray-400 font-medium mb-8">Enter your credentials to access the dashboard.</p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border-2 border-red-500 text-red-500 font-bold rounded flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-primary font-bold mb-2">Username</label>
                <input 
                  type="text" 
                  className="neu-input-dark"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-primary font-bold mb-2">Password</label>
                <input 
                  type="password" 
                  className="neu-input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="neu-btn-accent w-full flex justify-center items-center gap-2 group">
                Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-400 font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-black text-accent underline decoration-2 underline-offset-2 hover:text-secondary transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Stats/Visuals */}
      <div className="md:w-1/2 bg-background p-8 md:p-16 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-5xl font-black mb-6 text-primary leading-tight">
            Verify Medicine <span className="text-accent">Instantly</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join the network of hospitals and manufacturers ensuring patient safety through blockchain-verified supply chains.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="neu-card-dark p-6 bg-background/50 backdrop-blur-sm">
              <div className="text-4xl font-black text-secondary mb-2">100%</div>
              <div className="text-sm font-bold text-gray-400">Traceability</div>
            </div>
            <div className="neu-card-dark p-6 bg-background/50 backdrop-blur-sm">
              <div className="text-4xl font-black text-accent mb-2">0s</div>
              <div className="text-sm font-bold text-gray-400">Latency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;