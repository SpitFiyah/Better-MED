import { supabase } from './supabase';
import { Html5Qrcode } from "html5-qrcode";
import axios from 'axios';

// Helper to simulate Axios response structure
const createResponse = (data) => ({ data });
const createError = (message, status = 400) => {
    const err = new Error(message);
    err.response = { data: { error: message }, status };
    throw err;
};

// Helper: Client-Side AI Scan
const performClientSideAiScan = async (file) => {
    console.log("Starting client-side AI scan...");
    try {
        // 1. Roboflow: Detect Barcode Location
        const formData = new FormData();
        formData.append("file", file);
        
        const API_KEY = process.env.REACT_APP_ROBOFLOW_API_KEY || "cAtDjSsmRF18IIPgugys"; // Fallback for dev
        const MODEL_ID = "barcodes-zmxjq/4";
        const uploadUrl = `https://detect.roboflow.com/${MODEL_ID}?api_key=${API_KEY}&confidence=40&overlap=30&format=json`;

        console.log("Uploading to Roboflow...");
        const roboflowRes = await axios.post(uploadUrl, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        console.log("Roboflow response:", roboflowRes.data);
        const predictions = roboflowRes.data.predictions;
        if (!predictions || predictions.length === 0) {
            throw new Error("AI detected no barcodes in this image.");
        }

        // 2. Crop Image based on best prediction
        const bestPred = predictions.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
        console.log("Best prediction for cropping:", bestPred);
        
        // Load image to canvas
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        return new Promise((resolve, reject) => {
            img.onload = async () => {
                try {
                    console.log("Image loaded into canvas. Cropping...");
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const x = Math.max(0, bestPred.x - bestPred.width / 2);
                    const y = Math.max(0, bestPred.y - bestPred.height / 2);
                    const w = bestPred.width;
                    const h = bestPred.height;

                    canvas.width = w;
                    canvas.height = h;
                    
                    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
                    console.log("Cropping complete. Attempting to scan cropped image...");
                    
                    // 3. Scan the cropped region with Html5Qrcode
                    const html5QrCode = new Html5Qrcode("reader-hidden-temp");
                    
                    canvas.toBlob(async (blob) => {
                        if (!blob) { reject(new Error("Canvas to Blob failed")); return; }
                        const croppedFile = new File([blob], "cropped.png", { type: "image/png" });
                        
                        try {
                            const decodedText = await html5QrCode.scanFile(croppedFile, false);
                            console.log("Cropped scan successful:", decodedText);
                            resolve(decodedText);
                        } catch (scanErr) {
                            console.warn("Cropped scan failed. Attempting fallback on original file...", scanErr);
                            // Fallback: Try scanning the original file if crop failed
                            try {
                                const originalText = await html5QrCode.scanFile(file, false);
                                console.log("Fallback scan successful:", originalText);
                                resolve(originalText);
                            } catch (fallbackErr) {
                                console.error("Fallback scan also failed.", fallbackErr);
                                reject(new Error("AI detected a barcode, but could not read the text. Try a clearer photo."));
                            }
                        }
                    }, 'image/png');

                } catch (err) {
                    reject(err);
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = objectUrl;
        });

    } catch (err) {
        console.error("Client AI Scan Error:", err);
        // Check if the error is from Roboflow due to an invalid API key
        if (err.response && err.response.data && err.response.data.message === 'invalid api key') {
            throw new Error("The Roboflow API key is invalid. Please check your environment variables.");
        }
        throw err;
    }
};

// Supabase-backed API Adapter
const api = {
    get: async (url) => {
        console.log(`[Supabase API] GET ${url}`);
        
        if (url === '/admin/stats' || url === '/api/stats') {
            const { count: total } = await supabase.from('scan_logs').select('*', { count: 'exact', head: true });
            const { count: fake } = await supabase.from('scan_logs').select('*', { count: 'exact', head: true }).eq('status', 'FAKE');
            return createResponse({ total: total || 0, fake: fake || 0 });
        }
        
        if (url === '/history') {
            const { data, error } = await supabase.from('scan_logs').select('*').order('timestamp', { ascending: false }).limit(50);
            if (error) {
                console.error("Supabase History Error:", error);
                return createResponse([]); // Return empty on error to prevent crash
            }
            // Map Supabase columns to frontend expectations if needed
            const mappedData = data.map(log => ({
                id: log.id,
                batch_code: log.batch_id,
                status: log.status,
                timestamp: log.timestamp,
                scanned_by: log.scanned_by
            }));
            return createResponse(mappedData);
        }

        if (url === '/hospital/profile') {
             const { data: { user } } = await supabase.auth.getUser();
             if (!user) createError("Unauthorized", 401);
             return createResponse({ 
                 username: user.email.split('@')[0], 
                 role: user.user_metadata?.role || 'hospital',
                 hospital_name: user.user_metadata?.hospital_name || 'Unknown Hospital'
             });
        }

        return createResponse({});
    },

    post: async (url, body) => {
        console.log(`[Supabase API] POST ${url}`, body);

        if (url === '/auth/login') {
            // Allow both direct email input OR username (auto-append domain)
            const email = body.username.includes('@') ? body.username : `${body.username}@medicinna.app`;
            
            console.log(`Attempting login for: ${email}`); // Debug log

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: body.password,
            });

            if (error) {
                console.error("Supabase Login Error:", error);
                createError(error.message, 401);
            }
            
            // Store session
            localStorage.setItem('token', data.session.access_token);
            return createResponse({ 
                token: data.session.access_token, 
                role: data.user.user_metadata?.role || 'hospital',
                username: body.username 
            });
        }

        if (url === '/auth/register') {
            const email = body.username.includes('@') ? body.username : `${body.username}@medicinna.app`;
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: body.password,
                options: {
                    data: {
                        role: body.role || 'hospital',
                        hospital_name: body.hospital_name
                    }
                }
            });

            if (error) createError(error.message);
            return createResponse({ message: 'User created successfully' });
        }

        if (url === '/verify') {
            const code = body.batch_code;
            
            // 1. Fetch Batch from Supabase
            const { data: batch, error } = await supabase
                .from('batches')
                .select('*')
                .eq('batch_id', code)
                .single();
            
            let status = 'FAKE';
            let details = 'Batch not found in manufacturer database.';
            let medicine_info = null;

            if (batch) {
                medicine_info = batch;
                const expiry = new Date(batch.expiry_date);
                const now = new Date();

                if (batch.is_recalled) { 
                    status = 'RECALLED'; 
                    details = 'WARNING: This batch has been recalled by the manufacturer!'; 
                } else if (expiry < now) { 
                    status = 'EXPIRED'; 
                    details = `Expired on ${batch.expiry_date}`; 
                } else if (batch.purity < 90) {
                    status = 'SUBSTANDARD';
                    details = `Purity level (${batch.purity}%) is unsafe.`;
                } else { 
                    status = 'VALID'; 
                    details = 'Batch is authentic and safe to use.'; 
                }
            }

            // 2. Log the Scan
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('scan_logs').insert([{
                batch_id: code,
                status: status,
                timestamp: new Date().toISOString(),
                scanned_by: user?.email || 'anonymous'
            }]);

            return createResponse({ status, details, data: medicine_info });
        }

        if (url === '/api/batch') {
             const { error } = await supabase.from('batches').insert([body]);
             if (error) createError(error.message);
             return createResponse({ message: 'Batch Created' });
        }
        
        if (url === '/api/ai-scan') {
             try {
                 const file = body.get('image'); // Extract file from FormData
                 if (!file) createError("No image provided");
                 
                 const batchCode = await performClientSideAiScan(file);
                 return createResponse({ success: true, batch_code: batchCode });
             } catch (err) {
                 createError(err.message || "AI Scan Failed", 500);
             }
        }

        return createResponse({});
    }
};

export default api;
