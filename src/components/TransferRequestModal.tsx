import React, { useState, useEffect } from 'react';
import { TransferFormDataSchema } from '@/lib/schemas';
import type { TransferFormData } from '@/lib/schemas';
import { useTransferFormSubmission } from '@/lib/hooks';
import { ZodError } from 'zod';
import { XIcon } from './icons';

interface TransferRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof TransferFormData, string>>;

const TransferRequestModal: React.FC<TransferRequestModalProps> = ({ isOpen, onClose }: TransferRequestModalProps) => {
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { submit } = useTransferFormSubmission();

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
        setErrorMessage(null);
      }, 300); // match transition duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: TransferFormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof TransferFormData]) {
      setErrors((prev: FormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    try {
      TransferFormDataSchema.parse(formData);
      return {};
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err: ZodError['errors'][number]) => {
          const path = err.path[0] as keyof TransferFormData;
          newErrors[path] = err.message;
        });
        return newErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');
    try {
      await submit(formData);
      setStatus('success');
      setErrors({});
      setErrorMessage(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
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
          <div className="grow text-center py-8" aria-live="polite">
            <h3 className="text-2xl font-semibold text-success">Transfer Request Submitted!</h3>
            <p className="mt-2 text-slate-600">Thank you. We have received your request and will process the transfer. We will contact the destination pharmacy on your behalf.</p>
            <button onClick={onClose} className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grow space-y-4 overflow-y-auto pr-2 hide-scrollbar">
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
            {status === 'error' && <p className="text-center text-sm text-error" aria-live="polite">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default TransferRequestModal;