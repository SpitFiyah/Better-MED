import React, { useState } from 'react';
import { ScanBarcode } from 'lucide-react';
import VerifyBatch from '../components/VerifyBatch';

const VerifyPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVerificationComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans pb-24 md:pb-8">
      <header className="mb-6 md:mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3">
          <div className="p-2 bg-accent border-2 border-neu-border rounded-lg text-background shadow-neu-dark">
            <ScanBarcode className="w-6 h-6" />
          </div>
          Verify Batch
        </h1>
      </header>
      
      <main className="max-w-2xl mx-auto">
        <VerifyBatch onVerify={handleVerificationComplete} />
      </main>
    </div>
  );
};

export default VerifyPage;