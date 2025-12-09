import React, { useState, useEffect } from 'react';
import type { TransferFormData } from '../types';
import { XIcon } from './icons';

/**
 * BestRX Transfer Request Modal
 *
 * Integrates with BestRX PMS for prescription transfer requests.
 * Follows BestRX Prescription API specification for secure transfer submissions.
 *
 * API Endpoints:
 * - SubmitRxTransferRequest: Submit prescription transfer requests
 *
 * Transfer Methods:
 * - E-Transfer: For pharmacies within the same group
 * - Fax: For pharmacies outside the group (requires E-Fax service)
 *
 * @see https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest
 */

interface TransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormErrors = { [K in keyof TransferFormData]?: string };

const TransferRequestModal: React.FC<TransferRequestModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<TransferFormData>({
    rxNumber: '',
    rxFillDate: '',
    transferToPharmacyName: '',
    transferToPharmacyAddress1: '',
    transferToPharmacyAddress2: '',
    transferToPharmacyCity: '',
    transferToPharmacyState: '',
    transferToPharmacyZip: '',
    transferToPharmacyPhone: '',
    transferToPharmacyNCPDP: '',
    transferRxRemark: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          rxNumber: '',
          rxFillDate: '',
          transferToPharmacyName: '',
          transferToPharmacyAddress1: '',
          transferToPharmacyAddress2: '',
          transferToPharmacyCity: '',
          transferToPharmacyState: '',
          transferToPharmacyZip: '',
          transferToPharmacyPhone: '',
          transferToPharmacyNCPDP: '',
          transferRxRemark: '',
          consent: false,
        });
        setStatus('idle');
        setErrors({});
        setApiError(null);
      }, 300); // match transition duration
    }
  }, [isOpen]);

  /**
   * Handles input field changes and clears validation errors for the changed field.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof TransferFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Validates the transfer request form data according to BestRX API requirements
   * and HIPAA compliance standards.
   *
   * @returns {FormErrors} Object containing validation error messages keyed by field name
   */
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.rxNumber.trim() || isNaN(Number(formData.rxNumber))) {
      newErrors.rxNumber = 'A valid prescription number is required.';
    } else if (Number(formData.rxNumber) <= 0) {
      newErrors.rxNumber = 'Prescription number must be a positive number.';
    }
    
    if (!formData.rxFillDate.trim()) {
      newErrors.rxFillDate = 'Last fill date is required.';
    } else {
      const dateParts = formData.rxFillDate.split('-').map(Number);
      const selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.rxFillDate = 'Fill date cannot be in the future.';
      }
      
      // Check if date is not too old (more than 2 years ago)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      if (selectedDate < twoYearsAgo) {
        newErrors.rxFillDate = 'Fill date cannot be more than 2 years ago.';
      }
    }

    if (!formData.transferToPharmacyName.trim()) newErrors.transferToPharmacyName = 'Destination pharmacy name is required.';
    if (!formData.transferToPharmacyAddress1.trim()) newErrors.transferToPharmacyAddress1 = 'Address Line 1 is required.';
    if (!formData.transferToPharmacyCity.trim()) newErrors.transferToPharmacyCity = 'City is required.';
    if (!formData.transferToPharmacyState.trim()) {
      newErrors.transferToPharmacyState = 'State is required.';
    } else if (!/^[A-Z]{2}$/.test(formData.transferToPharmacyState.trim().toUpperCase())) {
      newErrors.transferToPharmacyState = 'Please use 2-letter state code (e.g., OH).';
    }
    if (!formData.transferToPharmacyZip.trim()) {
      newErrors.transferToPharmacyZip = 'ZIP code is required.';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.transferToPharmacyZip)) {
      newErrors.transferToPharmacyZip = 'Please enter a valid 5-digit ZIP code.';
    }

    if (!formData.transferToPharmacyPhone.trim()) {
      newErrors.transferToPharmacyPhone = 'Pharmacy phone number is required.';
    } else if (!/^(1\s?)?(\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}$/.test(formData.transferToPharmacyPhone)) {
      newErrors.transferToPharmacyPhone = 'Please enter a valid US phone number.';
    }

    // Validate NCPDP if provided
    if (formData.transferToPharmacyNCPDP.trim() && !/^\d{7}$/.test(formData.transferToPharmacyNCPDP.trim())) {
      newErrors.transferToPharmacyNCPDP = 'NCPDP number must be 7 digits.';
    }

    if (!formData.consent) newErrors.consent = 'You must authorize this transfer request.';

    return newErrors;
  };

  /**
   * Handles form submission for prescription transfer requests.
   *
   * Validates form data, transforms it according to BestRX Prescription API specification,
   * and submits the transfer request using HTTP Basic Authentication.
   *
   * Transfer routing is automatically handled by BestRX:
   * - E-Transfer for pharmacies within the same group
   * - Fax for pharmacies outside the group (requires E-Fax service)
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   *
   * @throws {Error} When Basic Auth credentials are not configured or network requests fail
   *
   * @see https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');
    
    // Validate environment variables are set for Basic Auth
    const username = process.env.BESTRX_USERNAME;
    const password = process.env.BESTRX_PASSWORD;
    const pharmacyNumber = process.env.BESTRX_PHARMACY_NUMBER;
    
    if (!username || !password || !pharmacyNumber) {
      console.error('BestRX Basic Auth credentials not configured');
      setApiError('Service configuration error. Please contact support.');
      setStatus('error');
      return;
    }
    
    const formattedTransferDate = new Date().toISOString().split('T')[0];
    
    const payload = {
      PharmacyNumber: pharmacyNumber,
      RxNo: Number(formData.rxNumber),
      RxFillDate: formData.rxFillDate, // Already in YYYY-MM-DD format
      TransferToPharmacy: {
        PharmacyName: formData.transferToPharmacyName.trim(),
        Address1: formData.transferToPharmacyAddress1.trim(),
        Address2: formData.transferToPharmacyAddress2.trim(),
        City: formData.transferToPharmacyCity.trim(),
        State: formData.transferToPharmacyState.trim().toUpperCase(),
        Zip: formData.transferToPharmacyZip.trim(),
        PharmacyNCPDP: formData.transferToPharmacyNCPDP.trim(),
        PharmacyPhoneNumber: formData.transferToPharmacyPhone.replace(/\D/g, ''),
        PharmacyFaxNumber: "", // Optional - will be populated if available
        ContactName: "", // Optional - will be populated if available
      },
      TransferDate: formattedTransferDate,
      RPHInitial: "VVP",
      ContactName: "Patient Web Request",
      TransferRxRemark: formData.transferRxRemark.trim(),
      UserID: "WEB",
      RxTransferType: 0, // 0 = all pending refills (confirm with BestRX)
    };

    console.log('Submitting transfer request:', {
      rxNumber: formData.rxNumber,
      destinationPharmacy: formData.transferToPharmacyName,
      transferDate: formattedTransferDate
    });

    try {
      // Create Basic Auth header
      const authString = btoa(`${username}:${password}`);
      
      const response = await fetch('https://dataservice.bestrxconnect.com/prescription/submitrxtransferrequest', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle HTTP error status codes and BestRX error codes
        const errorData = await response.json().catch(() => ({}));

        let errorMessage = 'An error occurred while processing your transfer request.';

        // Map BestRX error codes to user-friendly messages
        if (response.status === 400) {
          switch (errorData.ErrorCode || errorData.Code) {
            case 'ERROR0027':
              errorMessage = 'Please provide pharmacy number or NCPDP number.';
              break;
            case 'ERROR0069':
              errorMessage = 'Please provide valid fill date.';
              break;
            case 'ERROR0070':
              errorMessage = 'Fill date cannot be in the future.';
              break;
            case 'ERROR0080':
              errorMessage = 'Please provide valid RX number.';
              break;
            default:
              errorMessage = errorData.Message || 'Invalid request data. Please check your information.';
          }
        } else if (response.status === 401) {
          switch (errorData.ErrorCode || errorData.Code) {
            case 'ERROR0003':
              errorMessage = 'Authentication failed. Please contact support.';
              break;
            default:
              errorMessage = 'Access denied. Please contact support.';
          }
        } else if (response.status === 200 && errorData.ErrorCode === 'ERROR0082') {
          // BestRX sometimes returns application errors with HTTP 200
          errorMessage = 'Error while sending transfer Rx request. Please try again or contact support.';
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Handle successful response according to BestRX spec
      if (result.IsValid === false) {
        // Handle validation errors in the response
        const validationMessage = result.Data?.ListOfValidationMessage?.[0]?.Message ||
                                 result.Messages?.[0]?.Message ||
                                 'Transfer request validation failed.';
        throw new Error(validationMessage);
      }

      if (result.Data && result.Data.RxTransferred === true) {
        // Success - show transfer method used
        const transferMethod = result.Data.RxTransferredVia || 'Transfer';
        console.log(`Transfer successful via ${transferMethod}`);
        setStatus('success');
        setErrors({});
      } else {
        // Unexpected response structure
        setApiError('Unexpected response from pharmacy system. Please contact support.');
        setStatus('error');
      }

    } catch (error) {
      console.error('Transfer Request Failed:', error);
      
      // Use the specific error message thrown from the response handling
      let errorMessage = 'Could not connect to the pharmacy system.';
      
      if (error instanceof Error) {
        // If it's one of our custom error messages, use it directly
        if (error.message.includes('Please provide pharmacy number or NCPDP number') ||
            error.message.includes('Please provide valid fill date') ||
            error.message.includes('Fill date cannot be in the future') ||
            error.message.includes('Please provide valid RX number') ||
            error.message.includes('Authentication failed') ||
            error.message.includes('Access denied') ||
            error.message.includes('Error while sending transfer Rx request') ||
            error.message.includes('Transfer request validation failed') ||
            error.message.includes('Unexpected response from pharmacy system')) {
          errorMessage = error.message;
        } else if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        } else {
          // Generic error handling for other cases
          errorMessage = 'An unexpected error occurred. Please try again or contact support.';
        }
      }
      
      setApiError(errorMessage);
      setStatus('error');
    }
  };

  if (!isOpen) return null;
  
  const getInputClassName = (fieldName: keyof FormErrors) => 
    `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-burgundy focus:border-burgundy ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'}`;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="transfer-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>
      <div className="relative bg-white w-full max-w-2xl p-8 rounded-2xl shadow-xl transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 id="transfer-modal-title" className="text-2xl font-bold text-slate-900">Transfer Your Prescription Out</h2>
            <p className="mt-2 text-slate-600">Request to transfer a prescription from our pharmacy to another.</p>
          </div>
          <button onClick={onClose} aria-label="Close transfer prescription form" className="p-2 -mr-2 -mt-2 rounded-full text-slate-500 hover:bg-rose-mist hover:text-slate-800 transition-colors">
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex-grow text-center py-8" aria-live="polite">
            <h3 className="text-2xl font-semibold text-success">Transfer Request Submitted!</h3>
            <p className="mt-2 text-slate-600">Thank you. We have received your request and will process the transfer. We will contact the destination pharmacy on your behalf.</p>
            <button onClick={onClose} className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-grow space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            <fieldset>
              <legend className="text-lg font-semibold text-slate-800">Prescription to Transfer</legend>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label htmlFor="transfer-rxNumber" className="block text-sm font-medium text-slate-700">Prescription Number (Rx #)</label>
                  <input type="text" name="rxNumber" id="transfer-rxNumber" value={formData.rxNumber} onChange={handleChange} required className={getInputClassName('rxNumber')} aria-invalid={errors.rxNumber ? "true" : "false"} />
                  {errors.rxNumber && <p className="mt-1 text-sm text-error">{errors.rxNumber}</p>}
                </div>
                <div>
                  <label htmlFor="transfer-rxFillDate" className="block text-sm font-medium text-slate-700">Last Fill Date</label>
                  <input type="date" name="rxFillDate" id="transfer-rxFillDate" value={formData.rxFillDate} onChange={handleChange} required className={getInputClassName('rxFillDate')} aria-invalid={errors.rxFillDate ? "true" : "false"} />
                  {errors.rxFillDate && <p className="mt-1 text-sm text-error">{errors.rxFillDate}</p>}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-semibold text-slate-800">Destination Pharmacy</legend>
              <div className="mt-2 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="transfer-pharmacyName" className="block text-sm font-medium text-slate-700">Pharmacy Name</label>
                    <input type="text" name="transferToPharmacyName" id="transfer-pharmacyName" value={formData.transferToPharmacyName} onChange={handleChange} required className={getInputClassName('transferToPharmacyName')} aria-invalid={errors.transferToPharmacyName ? "true" : "false"} />
                    {errors.transferToPharmacyName && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyName}</p>}
                  </div>
                  <div>
                    <label htmlFor="transfer-pharmacyPhone" className="block text-sm font-medium text-slate-700">Pharmacy Phone</label>
                    <input type="tel" name="transferToPharmacyPhone" id="transfer-pharmacyPhone" value={formData.transferToPharmacyPhone} onChange={handleChange} required className={getInputClassName('transferToPharmacyPhone')} aria-invalid={errors.transferToPharmacyPhone ? "true" : "false"} />
                    {errors.transferToPharmacyPhone && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyPhone}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="transfer-pharmacyAddress1" className="block text-sm font-medium text-slate-700">Address Line 1</label>
                  <input type="text" name="transferToPharmacyAddress1" id="transfer-pharmacyAddress1" value={formData.transferToPharmacyAddress1} onChange={handleChange} required className={getInputClassName('transferToPharmacyAddress1')} aria-invalid={errors.transferToPharmacyAddress1 ? "true" : "false"} />
                  {errors.transferToPharmacyAddress1 && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyAddress1}</p>}
                </div>
                <div>
                  <label htmlFor="transfer-pharmacyAddress2" className="block text-sm font-medium text-slate-700">Address Line 2 (Optional)</label>
                  <input type="text" name="transferToPharmacyAddress2" id="transfer-pharmacyAddress2" value={formData.transferToPharmacyAddress2} onChange={handleChange} className={getInputClassName('transferToPharmacyAddress2')} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="transfer-pharmacyCity" className="block text-sm font-medium text-slate-700">City</label>
                    <input type="text" name="transferToPharmacyCity" id="transfer-pharmacyCity" value={formData.transferToPharmacyCity} onChange={handleChange} required className={getInputClassName('transferToPharmacyCity')} aria-invalid={errors.transferToPharmacyCity ? "true" : "false"} />
                    {errors.transferToPharmacyCity && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyCity}</p>}
                  </div>
                  <div>
                    <label htmlFor="transfer-pharmacyState" className="block text-sm font-medium text-slate-700">State</label>
                    <input type="text" name="transferToPharmacyState" id="transfer-pharmacyState" value={formData.transferToPharmacyState} onChange={handleChange} placeholder="OH" maxLength={2} required className={getInputClassName('transferToPharmacyState')} aria-invalid={errors.transferToPharmacyState ? "true" : "false"} />
                    {errors.transferToPharmacyState && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyState}</p>}
                  </div>
                  <div>
                    <label htmlFor="transfer-pharmacyZip" className="block text-sm font-medium text-slate-700">ZIP Code</label>
                    <input type="text" name="transferToPharmacyZip" id="transfer-pharmacyZip" value={formData.transferToPharmacyZip} onChange={handleChange} required className={getInputClassName('transferToPharmacyZip')} aria-invalid={errors.transferToPharmacyZip ? "true" : "false"} />
                    {errors.transferToPharmacyZip && <p className="mt-1 text-sm text-error">{errors.transferToPharmacyZip}</p>}
                  </div>
                </div>
                 <div>
                    <label htmlFor="transfer-pharmacyNCPDP" className="block text-sm font-medium text-slate-700">NCPDP / NABP Number (Optional)</label>
                    <input type="text" name="transferToPharmacyNCPDP" id="transfer-pharmacyNCPDP" value={formData.transferToPharmacyNCPDP} onChange={handleChange} className={getInputClassName('transferToPharmacyNCPDP')} />
                  </div>
              </div>
            </fieldset>

            <div>
              <label htmlFor="transfer-remark" className="block text-sm font-medium text-slate-700">Reason for Transfer (Optional)</label>
              <textarea id="transfer-remark" name="transferRxRemark" rows={2} value={formData.transferRxRemark} onChange={handleChange} placeholder="e.g., Moving, out of stock" className={getInputClassName('transferRxRemark')}></textarea>
            </div>
            
            <div className="relative flex items-start pt-2">
              <div className="flex items-center h-5">
                <input id="transfer-consent" name="consent" type="checkbox" checked={formData.consent} onChange={handleChange} required className={`focus:ring-burgundy h-4 w-4 text-burgundy rounded ${errors.consent ? 'border-red-500' : 'border-slate-300'}`} aria-invalid={errors.consent ? "true" : "false"} />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="transfer-consent" className="font-medium text-slate-700">I authorize Complete Healthcare Rx to transfer this prescription on my behalf.</label>
              </div>
            </div>
            {errors.consent && <p id="transfer-consent-error" className="-mt-3 text-sm text-error">{errors.consent}</p>}
            
            <div className="pt-4">
              <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark disabled:bg-slate-400">
                {status === 'submitting' ? 'Submitting Request...' : 'Submit Transfer Request'}
              </button>
            </div>
            {status === 'error' && <p className="text-center text-sm text-error" aria-live="polite">{apiError}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferRequestModal;