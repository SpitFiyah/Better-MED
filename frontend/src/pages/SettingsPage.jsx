import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';
import { Settings, Server, Save, ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
    const [apiUrl, setApiUrl] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUrl = localStorage.getItem('api_url') || 'http://localhost:8000';
        setApiUrl(storedUrl);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        // Remove trailing slash if present
        const cleanUrl = apiUrl.replace(/\/$/, "");
        localStorage.setItem('api_url', cleanUrl);
        alert("Server URL updated! Please login again.");
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            </div>

            <GlassCard className="w-full max-w-md">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-white">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-2xl font-bold neon-text flex items-center gap-2">
                        <Settings className="text-emerald-400" /> Settings
                    </h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Server className="w-4 h-4" /> Backend Server URL
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Enter the URL of your deployed backend (e.g., Render) or your PC's local IP if testing on WiFi.
                        </p>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                            placeholder="https://your-app.onrender.com"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            required
                        />
                    </div>

                    <NeonButton type="submit" className="w-full flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" /> Save Configuration
                    </NeonButton>
                </form>
            </GlassCard>
        </div>
    );
};

export default SettingsPage;
