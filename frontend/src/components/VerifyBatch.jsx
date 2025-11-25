import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Html5Qrcode } from "html5-qrcode";
import Tesseract from 'tesseract.js';
import { Search, CheckCircle, XCircle, AlertTriangle, AlertOctagon, ScanBarcode, Camera, Keyboard, Upload, Loader2, Activity } from 'lucide-react';

const VerifyBatch = ({ onVerify }) => {
  const [batchCode, setBatchCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('manual'); // 'manual', 'barcode', 'ocr', 'ai'
  const [cameraActive, setCameraActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [aiDetails, setAiDetails] = useState(null); // { batchCode, medicine }
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup scanner on unmount or mode change
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        scannerRef.current = null;
      }
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'ai') {
      setAiDetails(null);
    }
  }, [mode]);

  const startScanner = async () => {
    setCameraActive(true);
    setError('');
    
    // Give React a moment to render the div with id="reader"
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback (scanning in progress)
          // console.log(errorMessage); 
        }
      ).catch(err => {
        console.error("Error starting scanner", err);
        setError(`Camera Error: ${err.message || "Permission denied"}`);
        setCameraActive(false);
      });
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    setCameraActive(false);
  };

  const handleScanSuccess = (code) => {
    stopScanner();
    setBatchCode(code);
    // Auto verify
    setTimeout(() => document.getElementById('verify-btn')?.click(), 100);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setOcrProgress(0);
    setError('');
    setResult(null);

    // Attempt 1: Try to scan for barcodes in the image first
    try {
      // Use a temporary ID that doesn't need to exist in DOM for file scanning
      const html5QrCode = new Html5Qrcode("reader-hidden-temp-file");
      const decodedText = await html5QrCode.scanFile(file, false);
      console.log("File Scan Success:", decodedText);
      setBatchCode(decodedText);
      setTimeout(() => document.getElementById('verify-btn')?.click(), 100);
      setLoading(false);
      return; 
    } catch (err) {
      console.log("File scan failed, trying OCR...", err);
    }

    // Attempt 2: OCR
    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      console.log("OCR Text:", text);
      
      // Clean text: remove special chars, keep alphanumeric, dashes, spaces
      const cleanText = text.replace(/[^a-zA-Z0-9\-\s]/g, ' ').toUpperCase();
      
      // Regex for "MED-XXXX-XXX" or similar, allowing for spaces instead of dashes
      const batchPattern = /\b[A-Z]{3}[-\s]?\d{4}[-\s]?[A-Z0-9]{3}\b|\b[A-Z0-9]{8,}\b/g;
      const matches = cleanText.match(batchPattern);

      if (matches && matches.length > 0) {
        let bestMatch = matches[0];
        // Normalize: replace spaces with dashes if it looks like the standard format
        if (bestMatch.includes(' ')) {
             bestMatch = bestMatch.replace(/\s+/g, '-');
        }
        setBatchCode(bestMatch);
        setTimeout(() => document.getElementById('verify-btn')?.click(), 100);
      } else {
        // Fallback: Look for lines containing "BATCH" or "LOT"
        const lines = text.split('\n');
        const batchLine = lines.find(l => l.toUpperCase().includes('BATCH') || l.toUpperCase().includes('LOT'));
        if (batchLine) {
             const tokens = batchLine.trim().split(/[\s:]+/);
             // Take the last token that looks like a code
             const potentialCode = tokens.reverse().find(t => t.length > 3 && /\d/.test(t));
             if (potentialCode) {
                 setBatchCode(potentialCode.replace(/[^a-zA-Z0-9-]/g, ''));
                 setTimeout(() => document.getElementById('verify-btn')?.click(), 100);
                 setLoading(false);
                 return;
             }
        }
        setError("Could not detect a valid Batch ID. Please ensure the image is clear or try manual entry.");
      }

    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);
    setAiDetails(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/api/ai-scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success && response.data.batch_code) {
        setBatchCode(response.data.batch_code);
        setAiDetails({ batchCode: response.data.batch_code, medicine: response.data.medicine || null });
        // Automatically verify the found code
        const verifyRes = await api.post('/verify', { batch_code: response.data.batch_code });
        setResult(verifyRes.data);
        if (onVerify) onVerify();
      } else {
        setError('AI detected objects but could not read the barcode text. Please try a clearer photo.');
      }
    } catch (err) {
      console.error(err);
      setError(`AI Scan failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!batchCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/verify', { batch_code: batchCode });
      setResult(response.data);
      if (onVerify) onVerify(); // Refresh stats
    } catch (err) {
      setError('Verification failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      await api.get('/admin/stats'); // Simple GET request
      alert(`Connection Successful!`);
    } catch (err) {
      alert(`Connection Failed. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-card-dark p-6 bg-background">
      <div className="flex justify-between items-center mb-6 border-b-2 border-neu-border pb-4">
        <h2 className="text-xl font-black text-primary">Verify Medicine Batch</h2>
        <div className="flex gap-2">
          <button 
            onClick={testConnection}
            className="p-2 rounded-lg border-2 border-neu-border bg-transparent hover:bg-gray-800"
            title="Test Network Connection"
          >
            <Activity className="w-5 h-5 text-accent" />
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`p-2 rounded-lg border-2 border-neu-border transition-all ${mode === 'manual' ? 'bg-accent text-background shadow-neu-dark-sm' : 'bg-transparent text-primary hover:bg-gray-800'}`}
            title="Manual Entry"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMode('barcode')}
            className={`p-2 rounded-lg border-2 border-neu-border transition-all ${mode === 'barcode' ? 'bg-accent text-background shadow-neu-dark-sm' : 'bg-transparent text-primary hover:bg-gray-800'}`}
            title="Barcode Scan"
          >
            <ScanBarcode className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMode('ocr')}
            className={`p-2 rounded-lg border-2 border-neu-border transition-all ${mode === 'ocr' ? 'bg-accent text-background shadow-neu-dark-sm' : 'bg-transparent text-primary hover:bg-gray-800'}`}
            title="OCR Scan"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMode('ai')}
            className={`p-2 rounded-lg border-2 border-neu-border transition-all ${mode === 'ai' ? 'bg-accent text-background shadow-neu-dark-sm' : 'bg-transparent text-primary hover:bg-gray-800'}`}
            title="AI Smart Scan"
          >
            <ScanBarcode className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Mode Content */}
      {mode === 'manual' && (
        <div className="mb-6">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button onClick={() => setBatchCode("MED-2025-001")} className="px-3 py-1 text-xs font-bold bg-accent text-background rounded-full border-2 border-neu-border shadow-neu-dark-sm hover:translate-y-1 hover:shadow-none transition-all">
              Valid Demo
            </button>
            <button onClick={() => setBatchCode("EXP-2023-999")} className="px-3 py-1 text-xs font-bold bg-red-400 text-background rounded-full border-2 border-neu-border shadow-neu-dark-sm hover:translate-y-1 hover:shadow-none transition-all">
              Expired Demo
            </button>
            <button onClick={() => setBatchCode("REC-2025-BAD")} className="px-3 py-1 text-xs font-bold bg-yellow-400 text-background rounded-full border-2 border-neu-border shadow-neu-dark-sm hover:translate-y-1 hover:shadow-none transition-all">
              Recalled Demo
            </button>
            <button onClick={() => setBatchCode("LOW-2025-PUR")} className="px-3 py-1 text-xs font-bold bg-secondary text-background rounded-full border-2 border-neu-border shadow-neu-dark-sm hover:translate-y-1 hover:shadow-none transition-all">
              Substandard Demo
            </button>
            <button onClick={() => setBatchCode("FAKE-123")} className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-full border-2 border-neu-border shadow-neu-dark-sm hover:translate-y-1 hover:shadow-none transition-all">
              Fake Demo
            </button>
          </div>

          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Batch ID (e.g., MED-2025-001)"
                className="neu-input-dark pl-10 font-mono uppercase"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
              />
            </div>
            <button 
              id="verify-btn"
              type="submit" 
              disabled={loading}
              className="neu-btn px-6 py-2 flex items-center justify-center"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      )}

      {mode === 'barcode' && (
        <div className="mb-6 text-center p-4 border-2 border-dashed border-neu-border rounded-xl bg-background relative overflow-hidden">
          {!cameraActive ? (
            <>
              <div className="w-16 h-16 bg-accent border-2 border-neu-border rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-dark-sm">
                <ScanBarcode className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-lg font-black text-primary mb-2">Scan Medicine Barcode</h3>
              <p className="text-gray-400 font-medium mb-6 text-sm">Point your camera at the 2D Data Matrix or Barcode.</p>
              <button 
                onClick={startScanner}
                disabled={loading}
                className="neu-btn-accent flex items-center gap-2 mx-auto"
              >
                {loading ? 'Starting Camera...' : (
                  <>
                    <Camera className="w-4 h-4" />
                    Activate Camera
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden border-2 border-neu-border">
              <div id="reader" className="w-full h-64 bg-black"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-bold border border-white/20 backdrop-blur-sm">
                  Scanning for codes...
                </span>
              </div>
              <button 
                onClick={stopScanner}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full border-2 border-neu-border shadow-neu-dark-sm z-10 hover:bg-red-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}
          {/* Hidden verify button for auto-trigger */}
          <button id="verify-btn" onClick={handleVerify} className="hidden"></button>
        </div>
      )}

      {mode === 'ocr' && (
        <div className="mb-6 text-center p-8 border-2 border-dashed border-neu-border rounded-xl bg-background">
          <div className="w-16 h-16 bg-accent border-2 border-neu-border rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-dark-sm">
            <Upload className="w-8 h-8 text-background" />
          </div>
          <h3 className="text-lg font-black text-primary mb-2">Upload Label Image (OCR)</h3>
          <p className="text-gray-400 font-medium mb-6 text-sm">Upload a clear photo of the medicine label to extract the Batch ID automatically.</p>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="neu-btn-accent flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing ({ocrProgress}%)...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Select Image
              </>
            )}
          </button>
          {/* Hidden verify button for auto-trigger */}
          <button id="verify-btn" onClick={handleVerify} className="hidden"></button>
        </div>
      )}

      {mode === 'ai' && (
        <div className="mb-6 text-center p-8 border-2 border-dashed border-neu-border rounded-xl bg-background">
          <div className="w-16 h-16 bg-accent border-2 border-neu-border rounded-full flex items-center justify-center mx-auto mb-4 shadow-neu-dark-sm">
            <Camera className="w-8 h-8 text-background" />
          </div>
          <h3 className="text-lg font-black text-primary mb-2">AI Smart Scan</h3>
          <p className="text-gray-400 font-medium mb-6 text-sm">Take a photo and let AI detect and read the barcode.</p>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            id="ai-scan-input"
            onChange={handleAiScan}
          />
          
          <label 
            htmlFor="ai-scan-input"
            className={`neu-btn-accent flex items-center gap-2 mx-auto w-fit cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Take Photo
              </>
            )}
          </label>
          {aiDetails && (
            <div className="mt-6 w-full text-left bg-black/40 border-2 border-neu-border rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">Detected Batch</p>
              <p className="text-2xl font-black text-primary mt-1">{aiDetails.batchCode}</p>
              {aiDetails.medicine ? (
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="block text-gray-400 font-bold opacity-70">Medicine</span>
                    <span className="font-black text-primary">{aiDetails.medicine.medicine_name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-70">Manufacturer</span>
                    <span className="font-black text-primary">{aiDetails.medicine.manufacturer}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-70">Expiry</span>
                    <span className="font-black text-primary">{aiDetails.medicine.expiry_date}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-70">Purity</span>
                    <span className={`font-black ${aiDetails.medicine.purity_level < 90 ? 'text-red-400' : 'text-green-400'}`}>
                      {aiDetails.medicine.purity_level}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-3">No manufacturer record yet. Verification will auto-log this scan.</p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border-2 border-red-500 text-red-400 font-bold rounded-lg mb-4 shadow-neu-dark-sm">
          {error}
        </div>
      )}

      {result && (
        <div className={`p-6 rounded-xl border-2 shadow-neu-dark-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ${
          result.status === 'VALID' ? 'bg-green-900/20 border-green-500' : 
          result.status === 'FAKE' ? 'bg-red-900/20 border-red-500' :
          result.status === 'EXPIRED' ? 'bg-red-900/20 border-red-500' :
          result.status === 'SUBSTANDARD' ? 'bg-purple-900/20 border-purple-500' :
          'bg-yellow-900/20 border-yellow-500'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full border-2 bg-background ${
              result.status === 'VALID' ? 'border-green-500' : 
              result.status === 'FAKE' ? 'border-red-500' :
              result.status === 'EXPIRED' ? 'border-red-500' :
              result.status === 'SUBSTANDARD' ? 'border-purple-500' :
              'border-yellow-500'
            }`}>
              {result.status === 'VALID' ? <CheckCircle className="w-8 h-8 text-green-500" /> : 
               result.status === 'FAKE' ? <AlertOctagon className="w-8 h-8 text-red-500" /> :
               result.status === 'EXPIRED' ? <XCircle className="w-8 h-8 text-red-500" /> :
               <AlertTriangle className="w-8 h-8 text-yellow-500" />}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-black mb-1 ${
                result.status === 'VALID' ? 'text-green-400' : 
                result.status === 'FAKE' ? 'text-red-400' :
                result.status === 'EXPIRED' ? 'text-red-400' :
                result.status === 'SUBSTANDARD' ? 'text-purple-400' :
                'text-yellow-400'
              }`}>
                {result.status}
              </h3>
              <p className="text-gray-300 font-bold mb-4">{result.details}</p>
              
              {result.data && (
                <div className="grid grid-cols-2 gap-4 text-sm bg-black/40 p-4 rounded-lg border-2 border-neu-border">
                  <div>
                    <span className="block text-gray-400 font-bold opacity-60">Medicine</span>
                    <span className="font-black text-primary">{result.data.medicine_name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-60">Manufacturer</span>
                    <span className="font-black text-primary">{result.data.manufacturer}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-60">Expiry Date</span>
                    <span className="font-black text-primary">{result.data.expiry_date}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-bold opacity-60">Purity Level</span>
                    <span className={`font-black ${result.data.purity_level < 90 ? 'text-red-400' : 'text-green-400'}`}>
                      {result.data.purity_level}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden div for file scanning */}
      <div id="reader-hidden" className="hidden"></div>
    </div>
  );
};

export default VerifyBatch;
