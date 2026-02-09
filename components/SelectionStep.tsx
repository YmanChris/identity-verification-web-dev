
import React from 'react';
import { Country, DocType } from '../types';

interface SelectionStepProps {
  country: Country;
  setCountry: (c: Country) => void;
  docType: DocType;
  setDocType: (d: DocType) => void;
  onContinue: () => void;
}

const SelectionStep: React.FC<SelectionStepProps> = ({ 
  country, 
  setCountry, 
  docType, 
  setDocType,
  onContinue 
}) => {
  const isSG = country === 'SG';

  const docOptions = [
    { type: DocType.PASSPORT, icon: 'PassportIcon', enabled: isSG },
    { type: DocType.DRIVERS_LICENSE, icon: 'DriveIcon', enabled: false }, // Only ID and Passport for this requirement
    { type: DocType.NATIONAL_ID, icon: 'IdIcon', enabled: true },
    { type: DocType.RESIDENCE_PERMIT, icon: 'ResidenceIcon', enabled: false },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Select document type</h1>
      <p className="text-gray-500 mb-8">Please choose the type of your identification document.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country of Issue <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select 
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="CN">China (CN)</option>
            <option value="SG">Singapore (SG)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {docOptions.map((opt) => (
          <button
            key={opt.type}
            disabled={!opt.enabled}
            onClick={() => setDocType(opt.type)}
            className={`
              relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 h-32
              ${!opt.enabled ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50' : 
                docType === opt.type ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <div className={`mb-3 ${docType === opt.type ? 'text-blue-600' : 'text-gray-600'}`}>
              {opt.type === DocType.PASSPORT && <PassportIcon />}
              {opt.type === DocType.NATIONAL_ID && <IdIcon />}
              {opt.type === DocType.DRIVERS_LICENSE && <DriveIcon />}
              {opt.type === DocType.RESIDENCE_PERMIT && <ResidenceIcon />}
            </div>
            <span className={`text-sm font-semibold ${docType === opt.type ? 'text-blue-900' : 'text-gray-600'}`}>
              {opt.type}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Icons as mini-components
const PassportIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);
const IdIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        <rect x="7" y="10" width="4" height="4" rx="1" />
    </svg>
);
const DriveIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.5" />
        <circle cx="8" cy="12" r="2" strokeWidth="1.5" />
        <path d="M13 10h4M13 14h2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const ResidenceIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default SelectionStep;
