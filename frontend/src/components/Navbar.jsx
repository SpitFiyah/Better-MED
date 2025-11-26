import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Scan, Settings, LogOut, Factory } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const role = localStorage.getItem('role');

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-neu-border p-2 flex justify-around items-center z-50 pb-safe">
      <Link to="/dashboard" className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive('/dashboard') ? 'text-background bg-accent border-2 border-neu-border shadow-neu-dark-sm' : 'text-gray-400 hover:text-primary'}`}>
        <Home className="w-6 h-6" />
        <span className="text-xs font-bold mt-1">Home</span>
      </Link>

      <Link to="/verify" className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive('/verify') ? 'text-background bg-accent border-2 border-neu-border shadow-neu-dark-sm' : 'text-gray-400 hover:text-primary'}`}>
        <Scan className="w-6 h-6" />
        <span className="text-xs font-bold mt-1">Verify</span>
      </Link>

      {role === 'manufacturer' && (
        <Link to="/manufacturer" className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive('/manufacturer') ? 'text-background bg-accent border-2 border-neu-border shadow-neu-dark-sm' : 'text-gray-400 hover:text-primary'}`}>
          <Factory className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">Factory</span>
        </Link>
      )}

      <button onClick={handleLogout} className="flex flex-col items-center p-2 rounded-lg text-gray-400 hover:text-red-500 transition-all">
        <LogOut className="w-6 h-6" />
        <span className="text-xs font-bold mt-1">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;