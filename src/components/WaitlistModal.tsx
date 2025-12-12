import React, { useState, useEffect } from 'react';
import { WaitlistFormDataSchema } from '@/lib/schemas';
import type { WaitlistFormData } from '@/lib/schemas';
import { useWaitlistFormSubmission } from '@/lib/hooks';
import { ZodError } from 'zod';
import { XIcon } from './icons';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof WaitlistFormData, string>>;

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<WaitlistFormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { submit } = useWaitlistFormSubmission();

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({ name: '', phone: '', email: '' });
        setStatus('idle');
        setErrors({});
        setErrorMessage(null);
      }, 300); // match transition duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof WaitlistFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validate = (): FormErrors => {
    try {
      WaitlistFormDataSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof WaitlistFormData;
          newErrors[path] = err.message;
        });
        return newErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setStatus('submitting');
    setErrorMessage(null);
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


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

      {/* Modal Panel */}
      <div className="relative bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl transform transition-all">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="waitlist-modal-title" className="text-2xl font-bold text-slate-900">
              Join the RPM Waitlist
            </h2>
            <p className="mt-2 text-slate-600">
              Be the first to know when our Remote Patient Monitoring service launches.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close RPM waitlist modal"
            className="p-2 -mr-2 -mt-2 rounded-full text-slate-500 hover:bg-rose-mist hover:text-slate-800 transition-colors"
          >
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="mt-6 text-center py-8" aria-live="polite">
            <h3 className="text-2xl font-semibold text-success">You're on the list!</h3>
            <p className="mt-2 text-slate-600">Thank you for your interest. We'll be in touch soon with updates.</p>
            <button
              onClick={onClose}
              className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="waitlist-name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input 
                type="text" 
                name="name" 
                id="waitlist-name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className={getInputClassName('name')}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? 'waitlist-name-error' : undefined}
              />
              {errors.name && <p id="waitlist-name-error" className="mt-1 text-sm text-error">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="waitlist-email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                id="waitlist-email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className={getInputClassName('email')}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? 'waitlist-email-error' : undefined}
              />
              {errors.email && <p id="waitlist-email-error" className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="waitlist-phone" className="block text-sm font-medium text-slate-700">Phone (Optional)</label>
              <input 
                type="tel" 
                name="phone" 
                id="waitlist-phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className={getInputClassName('phone')}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? 'waitlist-phone-error' : undefined}
              />
              {errors.phone && <p id="waitlist-phone-error" className="mt-1 text-sm text-error">{errors.phone}</p>}
            </div>
            <div>
              <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:bg-slate-400">
                {status === 'submitting' ? 'Submitting...' : 'Join Now'}
              </button>
            </div>
            {status === 'error' && <p className="text-center text-sm text-error" aria-live="polite">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default WaitlistModal;