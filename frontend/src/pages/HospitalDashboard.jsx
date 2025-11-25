import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { Building2, MapPin, FileText, LogOut, AlertTriangle } from 'lucide-react';

const HospitalDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/hospital/profile');
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        // api.js interceptor handles 401/403 redirects usually, but we can keep this for safety
        if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 422)) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to connect to the server. Please ensure the backend is running.');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="neu-card-dark p-8 rounded-xl shadow-neu-dark text-center max-w-md bg-background">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-primary mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="neu-btn-accent px-6 py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Navbar */}
      <nav className="bg-background border-b-2 border-neu-border px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg border-2 border-neu-border shadow-neu-dark-sm">
            <Building2 className="w-6 h-6 text-background" />
          </div>
          <h1 className="text-2xl font-black text-primary">Hospital Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-bold hidden md:block">{profile.name}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:bg-red-900/20 px-4 py-2 rounded-lg transition border-2 border-transparent hover:border-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="neu-card-dark rounded-2xl overflow-hidden bg-background">
          <div className="bg-accent/10 px-8 py-6 border-b-2 border-neu-border">
            <h2 className="text-xl font-black text-accent">Hospital Profile</h2>
            <p className="text-accent/80 text-sm font-bold">Manage your institution's details and verification history</p>
          </div>
          
          <div className="p-8 grid gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-3 rounded-lg border-2 border-neu-border">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Institution Name</label>
                <p className="text-lg font-black text-primary">{profile.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-3 rounded-lg border-2 border-neu-border">
                <MapPin className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Address</label>
                <p className="text-lg text-primary">{profile.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gray-800 p-3 rounded-lg border-2 border-neu-border">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">License Number</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono font-bold text-primary bg-black/40 px-3 py-1 rounded border-2 border-neu-border">
                    {profile.license_no}
                  </p>
                  <span className="text-xs font-black text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;