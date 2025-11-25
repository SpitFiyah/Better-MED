import React from 'react';
import { Activity } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative mb-4">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-accent rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Activity className="w-6 h-6 text-accent" />
        </div>
      </div>
      <h2 className="text-xl font-black text-primary animate-pulse">Loading Medicinna...</h2>
      <p className="text-gray-400 text-sm mt-2 font-bold">Verifying credentials & fetching data</p>
    </div>
  );
};

export default Loading;