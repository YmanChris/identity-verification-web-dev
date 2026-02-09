
import React, { useState, useEffect } from 'react';
import { Country, DocType, Step, DocSide } from './types';
import SelectionStep from './components/SelectionStep';
import ActionChoiceStep from './components/ActionChoiceStep';
import CameraStep from './components/CameraStep';
import UploadStep from './components/UploadStep';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('SELECTION');
  const [country, setCountry] = useState<Country>('CN');
  const [docType, setDocType] = useState<DocType>(DocType.NATIONAL_ID);
  
  // State for multi-side capture
  const [currentSide, setCurrentSide] = useState<DocSide>('FRONT');
  const [images, setImages] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null
  });

  // When country changes, ensure docType is valid for that country
  useEffect(() => {
    if (country === 'CN') {
      setDocType(DocType.NATIONAL_ID);
    }
  }, [country]);

  const resetFlow = () => {
    setStep('SELECTION');
    setCurrentSide('FRONT');
    setImages({ front: null, back: null });
  };

  const handleBack = () => {
    if (step === 'CHOOSE_METHOD') {
      resetFlow();
    } else if (step === 'CAMERA' || step === 'UPLOAD') {
      // If we are on the BACK side of an ID, go back to FRONT side
      if (docType === DocType.NATIONAL_ID && currentSide === 'BACK') {
        setCurrentSide('FRONT');
        setImages(prev => ({ ...prev, back: null })); // Optional: clear back image
      } else {
        // Otherwise go back to method choice
        setStep('CHOOSE_METHOD');
        setCurrentSide('FRONT'); // Reset to front if we leave the capture screen
        setImages({ front: null, back: null });
      }
    } else if (step === 'SUCCESS') {
      // Back from Success/Review goes to Retake logic
      handleRetake();
    }
  };

  const handleImageCapture = (url: string) => {
    if (docType === DocType.PASSPORT) {
      // Passport only needs one image
      setImages({ front: url, back: null });
      setStep('SUCCESS');
    } else {
      // National ID needs Front and Back
      if (currentSide === 'FRONT') {
        setImages(prev => ({ ...prev, front: url }));
        setCurrentSide('BACK');
        // We stay on the same step (CAMERA or UPLOAD) but the props will change
      } else {
        setImages(prev => ({ ...prev, back: url }));
        setStep('SUCCESS');
      }
    }
  };

  const handleRetake = () => {
    // Return to the very beginning (Selection Step)
    resetFlow();
  };

  const handleConfirm = () => {
    // Construct the payload
    const payload: any = {
      country: country,
      docType: docType,
      images: {}
    };

    if (images.front) {
      payload.images.front = images.front;
    }
    
    // Only add back image if it exists (e.g. for National ID)
    if (images.back) {
      payload.images.back = images.back;
    }

    console.log(JSON.stringify(payload, null, 2));
    
    resetFlow();
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Header Decoration */}
      <div className="pt-8 pb-4 border-b border-gray-100 flex items-center justify-center shrink-0">
          <div className="flex items-center space-x-3 text-slate-700 font-bold tracking-widest text-sm">
              <div className="h-px w-12 bg-gray-200"></div>
              <span>BY <span className="text-blue-900">ARES</span></span>
              <div className="h-px w-12 bg-gray-200"></div>
          </div>
      </div>

      {/* Dynamic Step Rendering */}
      <div className="flex-1 flex flex-col w-full max-w-lg mx-auto p-6">
        {step === 'SELECTION' && (
          <SelectionStep 
            country={country} 
            setCountry={setCountry} 
            docType={docType} 
            setDocType={setDocType}
            onContinue={() => setStep('CHOOSE_METHOD')}
          />
        )}

        {step === 'CHOOSE_METHOD' && (
          <ActionChoiceStep 
            onBack={handleBack}
            onCamera={() => setStep('CAMERA')}
            onUpload={() => setStep('UPLOAD')}
          />
        )}

        {step === 'CAMERA' && (
          <CameraStep 
            docType={docType}
            side={currentSide}
            onBack={handleBack}
            onCapture={handleImageCapture}
          />
        )}

        {step === 'UPLOAD' && (
          <UploadStep 
            docType={docType}
            side={currentSide}
            onBack={handleBack}
            onFileSelected={handleImageCapture}
          />
        )}

        {step === 'SUCCESS' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in pb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Documents</h2>
            <p className="text-gray-500 mb-8">Please review your photos before confirming.</p>
            
            {/* Image Preview Area */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full justify-center items-center">
              {images.front && (
                <div className="flex flex-col items-center w-full sm:w-1/2 max-w-[200px]">
                   <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                      <img src={images.front} alt="Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                   </div>
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Front Side</span>
                </div>
              )}
              {images.back && (
                <div className="flex flex-col items-center w-full sm:w-1/2 max-w-[200px]">
                   <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                      <img src={images.back} alt="Back" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                   </div>
                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Back Side</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3 mt-auto">
              <button 
                onClick={handleConfirm}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 transition-all active:scale-[0.99]"
              >
                Confirm
              </button>
              
              <button 
                onClick={handleRetake}
                className="w-full py-4 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.99]"
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
