import React, { useState, useRef, useEffect } from 'react';
import { SplashModalFormDataSchema } from '@/lib/schemas';
import type { SplashModalFormData } from '@/lib/schemas';
import { useSplashModalFormSubmission } from '@/lib/hooks';
import { ZodError } from 'zod';
import { XIcon } from './icons';

interface SplashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof SplashModalFormData, string>>;

const SplashModal: React.FC<SplashModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<SplashModalFormData>({ email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { submit } = useSplashModalFormSubmission();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({ email: '' });
        setStatus('idle');
        setErrors({});
        setErrorMessage(null);
      }, 300); // match transition duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.email) {
      setErrors({});
    }
  };

  const validate = (): FormErrors => {
    try {
      SplashModalFormDataSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const path = err.path[0] as keyof SplashModalFormData;
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
      emailInputRef.current?.focus();
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true"></div>

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl transform transition-all overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="hidden md:block">
            <img 
              src="https://iili.io/KDDaY9s.png"
              alt="Prescription delivery service"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="splash-modal-title" className="text-2xl font-bold text-slate-900">
                  Local Delivery Coming Soon!
                </h2>
                <p className="mt-2 text-slate-600">
                  Get your prescriptions delivered right to your door. Opt-in to be the first to know when our convenient delivery service is available.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close promotion modal"
                className="p-2 -mr-2 -mt-2 rounded-full text-slate-500 hover:bg-rose-mist hover:text-slate-800 transition-colors"
              >
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="mt-6 text-center py-8" aria-live="polite">
                <h3 className="text-2xl font-semibold text-success">You're on the list!</h3>
                <p className="mt-2 text-slate-600">We'll notify you as soon as our delivery service is ready.</p>
                <button
                  onClick={onClose}
                  className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="splash-email" className="sr-only">Email Address</label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    id="splash-email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className={`block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-burgundy focus:border-burgundy ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'splash-email-error' : undefined}
                  />
                  {errors.email && <p id="splash-email-error" className="mt-1 text-sm text-error">{errors.email}</p>}
                </div>
                <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:bg-slate-400">
                  {status === 'submitting' ? 'Submitting...' : 'Notify Me'}
                </button>
                {status === 'error' && <p className="text-center text-sm text-error" aria-live="polite">{errorMessage}</p>}
                 <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-center text-sm text-slate-600 hover:text-burgundy font-semibold mt-2"
                >
                    No, thanks
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashModal;
