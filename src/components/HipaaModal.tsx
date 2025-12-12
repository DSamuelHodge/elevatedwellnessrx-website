

import React from 'react';
import { XIcon } from './icons';

interface HipaaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HipaaModal: React.FC<HipaaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hipaa-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Panel */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h2 id="hipaa-modal-title" className="text-2xl font-bold text-slate-900">
              Notice of Privacy Practices
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Effective Date: October 1, 2023
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Notice of Privacy Practices modal"
            className="p-2 -mr-2 -mt-2 rounded-full text-slate-500 hover:bg-rose-mist hover:text-slate-800 transition-colors"
          >
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 hide-scrollbar">
          <p className="font-semibold">THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</p>
          
          <div>
            <h3 className="font-bold text-slate-800">Our Responsibilities</h3>
            <p>We are required by law to maintain the privacy of your Protected Health Information (PHI), provide you with this notice of our legal duties and privacy practices, and follow the terms of the notice that is currently in effect.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800">Your Rights</h3>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Inspect and Copy:</strong> You have the right to inspect and receive a copy of your PHI.</li>
              <li><strong>Amend:</strong> You can ask us to amend incorrect or incomplete information in your record.</li>
              <li><strong>Request Restrictions:</strong> You have the right to request a restriction on how your PHI is used or disclosed.</li>
              <li><strong>Confidential Communications:</strong> You can request that we communicate with you about your health in a specific way or at a certain location.</li>
              <li><strong>Accounting of Disclosures:</strong> You have the right to a list of disclosures we have made of your PHI.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800">How We May Use and Disclose Your PHI</h3>
            <p>We may use and disclose your PHI for treatment, payment, and health care operations without your written authorization. For example, we may use your information to fill your prescriptions or to bill your insurance company.</p>
          </div>

          <div>
             <h3 className="font-bold text-slate-800">Complaints</h3>
            <p>If you believe your privacy rights have been violated, you may file a complaint with our Privacy Officer or with the Secretary of the Department of Health and Human Services. You will not be penalized for filing a complaint.</p>
          </div>
          
          <div className="p-4 bg-cream rounded-lg text-sm">
            <p className="font-semibold text-slate-800">Disclaimer:</p>
            <p>This is a summary of our Notice of Privacy Practices. For a complete copy or to ask questions, please contact our pharmacy's Privacy Officer at the phone number listed on our site.</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
           <button
              onClick={onClose}
              className="w-full sm:w-auto sm:float-right flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default HipaaModal;