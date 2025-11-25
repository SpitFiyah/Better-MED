import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import VerifyBatch from '../components/VerifyBatch';
import { LogOut, LayoutDashboard, AlertTriangle, CheckCircle, Package, Activity, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch Stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      // Fetch History
      const historyRes = await api.get('/history');
      setLogs(historyRes.data);

    } catch (err) {
      console.error("Failed to fetch data", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 422)) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to connect to the server. Please ensure the backend is running.');
      }
    }
  };

  useEffect(() => {
    fetchData();
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

  if (!stats) return <Loading />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Navbar */}
      <nav className="bg-background border-b-2 border-neu-border px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-2 rounded-lg border-2 border-neu-border shadow-neu-dark-sm">
            <LayoutDashboard className="w-6 h-6 text-background" />
          </div>
          <h1 className="text-2xl font-black text-primary">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-400 font-bold">Welcome, Admin</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="neu-card-dark p-6 bg-background">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-bold">Total Batches</p>
                <h3 className="text-3xl font-black text-primary mt-1">{stats.total_batches}</h3>
              </div>
              <div className="p-3 bg-blue-900/20 rounded-lg border-2 border-blue-500">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="neu-card-dark p-6 bg-background">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-bold">Total Verifications</p>
                <h3 className="text-3xl font-black text-primary mt-1">{stats.total_verifications}</h3>
              </div>
              <div className="p-3 bg-green-900/20 rounded-lg border-2 border-green-500">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="neu-card-dark p-6 bg-background">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm font-bold">Recalled Batches</p>
                <h3 className="text-3xl font-black text-primary mt-1">{stats.recalled_batches}</h3>
              </div>
              <div className="p-3 bg-red-900/20 rounded-lg border-2 border-red-500">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Scanner */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-black text-primary">Live Verification Scanner</h2>
            </div>
            <VerifyBatch onVerify={fetchData} />
          </div>

          {/* Right Column: Recent Logs */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-black text-primary">Recent Activity Log</h2>
            </div>
            
            <div className="neu-card-dark overflow-hidden bg-background">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800 border-b-2 border-neu-border">
                    <tr>
                      <th className="px-6 py-3 font-black text-gray-400">Batch ID</th>
                      <th className="px-6 py-3 font-black text-gray-400">Status</th>
                      <th className="px-6 py-3 font-black text-gray-400">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-bold">
                          No verification activity yet.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-3 font-bold text-primary">{log.batch_code}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border ${
                              log.status === 'VALID' ? 'bg-green-900/20 text-green-400 border-green-500' :
                              log.status === 'FAKE' ? 'bg-red-900/20 text-red-400 border-red-500' :
                              log.status === 'EXPIRED' ? 'bg-orange-900/20 text-orange-400 border-orange-500' :
                              log.status === 'SUBSTANDARD' ? 'bg-purple-900/20 text-purple-400 border-purple-500' :
                              'bg-yellow-900/20 text-yellow-400 border-yellow-500'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-400 font-medium">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;