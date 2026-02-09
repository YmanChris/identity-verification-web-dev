
import React from 'react';

interface ActionChoiceStepProps {
  onBack: () => void;
  onCamera: () => void;
  onUpload: () => void;
}

const ActionChoiceStep: React.FC<ActionChoiceStepProps> = ({ onBack, onCamera, onUpload }) => {
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">How would you like to provide the document?</h1>

      <div className="space-y-4">
        <button 
          onClick={onCamera}
          className="w-full flex items-center p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Use Camera</h3>
            <p className="text-sm text-gray-500">Take a photo using your device</p>
          </div>
        </button>

        <button 
          onClick={onUpload}
          className="w-full flex items-center p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 mr-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Upload File</h3>
            <p className="text-sm text-gray-500">Select a file from your device</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActionChoiceStep;
