import React, { useState, useEffect } from 'react';
import { RefillFormDataSchema } from '@/lib/schemas';
import type { RefillFormData } from '@/lib/schemas';
import { useRefillFormSubmission } from '@/lib/hooks';
import { ZodError } from 'zod';
import { XIcon } from './icons';

interface RefillRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof RefillFormData, string>>;

const RefillRequestModal: React.FC<RefillRequestModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<RefillFormData>({
    patientName: '',
    dob: '',
    phone: '',
    email: '',
    prescriptionNumbers: '',
    medicationNames: '',
    preferredService: 'pickup',
    notes: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { submit } = useRefillFormSubmission();

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          patientName: '',
          dob: '',
          phone: '',
          email: '',
          prescriptionNumbers: '',
          medicationNames: '',
          preferredService: 'pickup',
          notes: '',
          consent: false,
        });
        setStatus('idle');
        setErrors({});
        setErrorMessage(null);
      }, 300); // match transition duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on change
    if (errors[name as keyof RefillFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    try {
      RefillFormDataSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof RefillFormData;
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

  if (!isOpen) {
    return null;
  }
  
  const getInputClassName = (fieldName: keyof FormErrors) => 
    `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-burgundy focus:border-burgundy ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'}`;
  
  const getTextAreaClassName = (fieldName: keyof FormErrors) =>
    `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-burgundy focus:border-burgundy ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refill-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Panel */}
      <div className="relative bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl transform transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h2 id="refill-modal-title" className="text-2xl font-bold text-slate-900">
              Request a Refill
            </h2>
            <p className="mt-2 text-slate-600">
              Easily request your prescription refills online.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close refill request form"
            className="p-2 -mr-2 -mt-2 rounded-full text-slate-500 hover:bg-rose-mist hover:text-slate-800 transition-colors"
          >
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="grow text-center py-8 overflow-y-auto" aria-live="polite">
            <h3 className="text-2xl font-semibold text-success">Refill Request Sent!</h3>
            <p className="mt-2 text-slate-600">Thank you. We have received your refill request and will process it shortly. We will contact you if there are any issues.</p>
            <button
              onClick={onClose}
              className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grow space-y-6 overflow-y-auto pr-2 hide-scrollbar">
            <div>
              <label htmlFor="refill-patientName" className="block text-sm font-medium text-slate-700">Patient Full Name</label>
              <input 
                type="text" 
                name="patientName" 
                id="refill-patientName" 
                value={formData.patientName} 
                onChange={handleChange} 
                required 
                className={getInputClassName('patientName')}
                aria-invalid={errors.patientName ? "true" : "false"}
                aria-describedby={errors.patientName ? 'refill-patientName-error' : undefined}
              />
              {errors.patientName && <p id="refill-patientName-error" className="mt-1 text-sm text-error">{errors.patientName}</p>}
            </div>
            <div>
              <label htmlFor="refill-dob" className="block text-sm font-medium text-slate-700">Date of Birth</label>
              <input 
                type="date" 
                name="dob" 
                id="refill-dob" 
                value={formData.dob} 
                onChange={handleChange} 
                required 
                className={getInputClassName('dob')}
                aria-invalid={errors.dob ? "true" : "false"}
                aria-describedby={errors.dob ? 'refill-dob-error' : undefined}
              />
              {errors.dob && <p id="refill-dob-error" className="mt-1 text-sm text-error">{errors.dob}</p>}
            </div>
            <div>
              <label htmlFor="refill-phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                id="refill-phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                className={getInputClassName('phone')}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? 'refill-phone-error' : undefined}
              />
              {errors.phone && <p id="refill-phone-error" className="mt-1 text-sm text-error">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="refill-email" className="block text-sm font-medium text-slate-700">Email Address (Optional)</label>
              <input 
                type="email" 
                name="email" 
                id="refill-email" 
                value={formData.email} 
                onChange={handleChange} 
                className={getInputClassName('email')}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? 'refill-email-error' : undefined}
              />
              {errors.email && <p id="refill-email-error" className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="refill-prescriptionNumbers" className="block text-sm font-medium text-slate-700">Prescription Number(s) <span className="text-red-500">*</span></label>
              <textarea 
                id="refill-prescriptionNumbers" 
                name="prescriptionNumbers" 
                rows={3} 
                value={formData.prescriptionNumbers} 
                onChange={handleChange} 
                placeholder="Enter one or more prescription numbers, separated by commas or new lines." 
                required
                className={getTextAreaClassName('prescriptionNumbers')}
                aria-invalid={errors.prescriptionNumbers ? "true" : "false"}
                aria-describedby={errors.prescriptionNumbers ? 'refill-prescriptionNumbers-error' : undefined}
              ></textarea>
              {errors.prescriptionNumbers && <p id="refill-prescriptionNumbers-error" className="mt-1 text-sm text-error">{errors.prescriptionNumbers}</p>}
            </div>
            <div>
              <label htmlFor="refill-medicationNames" className="block text-sm font-medium text-slate-700">Medication Name(s) (Optional)</label>
              <textarea 
                id="refill-medicationNames" 
                name="medicationNames" 
                rows={2} 
                value={formData.medicationNames} 
                onChange={handleChange} 
                placeholder="e.g., Metformin, Lisinopril" 
                className={getTextAreaClassName('medicationNames')}
                aria-invalid={errors.medicationNames ? "true" : "false"}
                aria-describedby={errors.medicationNames ? 'refill-medicationNames-error' : undefined}
              ></textarea>
              {errors.medicationNames && <p id="refill-medicationNames-error" className="mt-1 text-sm text-error">{errors.medicationNames}</p>}
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Preferred Service</legend>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="service-pickup"
                    name="preferredService"
                    type="radio"
                    value="pickup"
                    checked={formData.preferredService === 'pickup'}
                    onChange={handleChange}
                    className="focus:ring-burgundy h-4 w-4 text-burgundy border-slate-300"
                  />
                  <label htmlFor="service-pickup" className="ml-3 block text-sm font-medium text-slate-700">
                    Pickup at Pharmacy
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="service-delivery"
                    name="preferredService"
                    type="radio"
                    value="delivery"
                    checked={formData.preferredService === 'delivery'}
                    onChange={handleChange}
                    className="focus:ring-burgundy h-4 w-4 text-burgundy border-slate-300"
                  />
                  <label htmlFor="service-delivery" className="ml-3 block text-sm font-medium text-slate-700">
                    Local Delivery
                  </label>
                </div>
              </div>
            </fieldset>

            <div>
              <label htmlFor="refill-notes" className="block text-sm font-medium text-slate-700">Additional Notes (Optional)</label>
              <textarea 
                id="refill-notes" 
                name="notes" 
                rows={2} 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Any special instructions or questions about this refill?" 
                className={getTextAreaClassName('notes')}
                aria-invalid={errors.notes ? "true" : "false"}
                aria-describedby={errors.notes ? 'refill-notes-error' : undefined}
              ></textarea>
              {errors.notes && <p id="refill-notes-error" className="mt-1 text-sm text-error">{errors.notes}</p>}
            </div>

            <div className="relative flex items-start pt-2">
              <div className="flex items-center h-5">
                <input 
                  id="refill-consent" 
                  name="consent" 
                  type="checkbox" 
                  checked={formData.consent} 
                  onChange={handleChange} 
                  required 
                  className={`focus:ring-burgundy h-4 w-4 text-burgundy rounded ${errors.consent ? 'border-red-500' : 'border-slate-300'}`}
                  aria-invalid={errors.consent ? "true" : "false"}
                  aria-describedby="refill-consent-description"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="refill-consent" className="font-medium text-slate-700">I acknowledge that this information will be used to process my refill request.</label>
                <p id="refill-consent-description" className="text-slate-500">For medical emergencies, please call 911.</p>
              </div>
            </div>
            {errors.consent && <p id="refill-consent-error" className="-mt-4 text-sm text-error">{errors.consent}</p>}
            
            <div className="pt-4">
              <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:bg-slate-400">
                {status === 'submitting' ? 'Submitting Request...' : 'Submit Refill Request'}
              </button>
            </div>
            {status === 'error' && <p className="text-center text-sm text-error" aria-live="polite">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default RefillRequestModal;