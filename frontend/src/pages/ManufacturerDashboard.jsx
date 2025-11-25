import React, { useState } from 'react';
import api from '../api';
import { QRCodeCanvas } from 'qrcode.react';
import { Package, Calendar, Activity, CheckCircle, Printer } from 'lucide-react';

const ManufacturerDashboard = () => {
  const [formData, setFormData] = useState({
    batch_code: '',
    medicine_name: '',
    manufacturer: 'Medicinna Pharma',
    expiry_date: '',
    purity_level: 100.0
  });
  const [createdBatch, setCreatedBatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateBatchCode = () => {
    const code = `MED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({ ...formData, batch_code: code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreatedBatch(null);

    try {
      const response = await api.post('/api/batch', formData);
      setCreatedBatch(formData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-accent border-2 border-neu-border p-3 rounded-xl shadow-neu-dark">
            <Package className="w-8 h-8 text-background" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-primary">Manufacturer Portal</h1>
            <p className="text-gray-400 font-bold">Create and Tag New Medicine Batches</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Creation Form */}
          <div className="neu-card-dark p-8 bg-background">
            <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-accent" />
              New Batch Details
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-xl font-bold flex items-center gap-2 text-red-400">
                <Activity className="w-5 h-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-400 font-bold mb-2">Batch Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="batch_code"
                    value={formData.batch_code}
                    onChange={handleChange}
                    className="neu-input-dark flex-1"
                    placeholder="e.g. MED-2025-001"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateBatchCode}
                    className="neu-btn-accent bg-secondary text-background px-4"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-2">Medicine Name</label>
                <input
                  type="text"
                  name="medicine_name"
                  value={formData.medicine_name}
                  onChange={handleChange}
                  className="neu-input-dark"
                  placeholder="e.g. Amoxicillin 500mg"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-2">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="neu-input-dark"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-2">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    className="neu-input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-2">Purity (%)</label>
                  <input
                    type="number"
                    name="purity_level"
                    value={formData.purity_level}
                    onChange={handleChange}
                    className="neu-input-dark"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neu-btn-accent w-full flex justify-center items-center gap-2"
              >
                {loading ? 'Creating...' : 'Create Batch & Generate QR'}
              </button>
            </form>
          </div>

          {/* Right: QR Code Output */}
          <div className="flex flex-col gap-6">
            <div className={`neu-card-dark p-8 bg-background flex flex-col items-center justify-center text-center h-full transition-all ${createdBatch ? 'opacity-100' : 'opacity-50'}`}>
              {createdBatch ? (
                <>
                  <div className="bg-white p-4 border-4 border-neu-border rounded-xl shadow-neu-dark mb-6">
                    <QRCodeCanvas 
                      value={createdBatch.batch_code} 
                      size={200}
                      level={"H"}
                    />
                  </div>
                  <h3 className="text-3xl font-black text-primary mb-2">{createdBatch.batch_code}</h3>
                  <p className="text-lg font-bold text-gray-400 mb-6">{createdBatch.medicine_name}</p>
                  
                  <div className="flex gap-2 w-full">
                    <button className="neu-btn-accent flex-1 flex items-center justify-center gap-2 bg-transparent border-2 border-neu-border hover:bg-gray-800 text-primary shadow-none">
                      <Printer className="w-5 h-5" />
                      Print Label
                    </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-900/20 border-2 border-green-500 rounded-xl w-full">
                    <div className="flex items-center gap-2 justify-center font-black text-green-400">
                      <CheckCircle className="w-6 h-6" />
                      Batch Active in Database
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 opacity-50">
                  <Package className="w-24 h-24 mx-auto mb-4" />
                  <p className="font-bold text-xl">Fill the form to generate a batch QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;