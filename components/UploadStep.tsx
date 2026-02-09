
import React, { useRef } from 'react';
import { DocType, DocSide } from '../types';

interface UploadStepProps {
  docType: DocType;
  side: DocSide;
  onBack: () => void;
  onFileSelected: (url: string) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ docType, side, onBack, onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  let sideText = '';
  if (docType === DocType.PASSPORT) {
    sideText = 'Photo Page';
  } else {
    sideText = side === 'FRONT' ? 'Front Side' : 'Back Side';
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use FileReader to convert file to Base64 Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onFileSelected(base64String);
      };
      reader.readAsDataURL(file);
      
      // Reset input to allow selecting same file again if needed
      e.target.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload {docType}</h1>
      <p className="text-gray-500 mb-6">Please upload the <strong className="text-gray-700">{sideText}</strong> of your document.</p>

      <div 
        onClick={triggerUpload}
        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-10 bg-gray-50 hover:bg-blue-50/20 hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-6 group-hover:scale-110 group-hover:text-blue-500 transition-all">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-700 mb-2">Select {sideText} Image</p>
        <p className="text-sm text-gray-400 text-center max-w-[200px]">Supports JPEG, PNG and PDF files up to 10MB</p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept="image/*,application/pdf"
        />
      </div>

      <div className="mt-8">
        <button
          onClick={triggerUpload}
          className="w-full py-4 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
        >
          Choose Local File
        </button>
      </div>
    </div>
  );
};

export default UploadStep;
