

import React, { useState } from 'react';
import type { ContactFormData } from '../types';

type FormErrors = { [K in keyof ContactFormData]?: string };

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    reason: 'general',
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on change
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^(1\s?)?(\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid US phone number.';
    }

    if (['new', 'transfer', 'refill'].includes(formData.reason) && !formData.message.trim()) {
      newErrors.message = 'Please provide more details for your request.';
    } else if (formData.message.trim().length > 500) {
      newErrors.message = 'Message must be less than 500 characters.';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must acknowledge the statement to proceed.';
    }

    return newErrors;
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');
    try {
      // Mock API call - in a real app, this would be a fetch request
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form Submitted:', formData);
      setStatus('success');
      setErrors({});
      setFormData({ name: '', phone: '', email: '', reason: 'general', message: '', consent: false });
    } catch (error) {
      setStatus('error');
    }
  };

  const getInputClassName = (fieldName: keyof FormErrors) => 
    `mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-burgundy focus:border-burgundy ${errors[fieldName] ? 'border-red-500' : 'border-slate-300'}`;

  return (
    <section id="contact" className="bg-cream py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Get In Touch
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Have a question? We're here to help! Fill out the form below and we'll get back to you shortly.
            </p>
            <p id="phi-warning" className="mt-2 text-sm font-semibold text-error bg-red-100 p-2 rounded-md inline-block">
              Please do not include personal health information (PHI) in this form.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 bg-white p-8 rounded-2xl shadow-lg space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                <input 
          type="text" 
          name="name" 
          id="name" 
          autoComplete="name"
          value={formData.name} 
          onChange={handleChange} 
          required 
          className={getInputClassName('name')}
        aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1 text-sm text-error">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                <input 
          type="tel" 
          name="phone" 
          id="phone" 
          autoComplete="tel"
          value={formData.phone} 
          onChange={handleChange} 
          required 
          className={getInputClassName('phone')}
        aria-invalid={errors.phone ? "true" : "false"}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && <p id="phone-error" className="mt-1 text-sm text-error">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
           type="email" 
           name="email" 
           id="email" 
           autoComplete="email"
           value={formData.email} 
           onChange={handleChange} 
           required 
           className={getInputClassName('email')}
         aria-invalid={errors.email ? "true" : "false"}
           aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Contact</label>
              <select 
                id="reason" 
                name="reason" 
                value={formData.reason} 
                onChange={handleChange} 
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-slate-300 shadow-sm focus:outline-none focus:ring-burgundy focus:border-burgundy sm:text-sm rounded-md"
              >
                <option value="general">General Inquiry</option>
                <option value="new">New Prescription</option>
                <option value="transfer">Transfer Prescription</option>
                <option value="refill">Refill Question</option>
                <option value="rpm">RPM Waitlist</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows={4} 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Do not include health information..." 
                className={getInputClassName('message')}
                aria-invalid={errors.message ? "true" : "false"}
                aria-describedby={`${errors.message ? 'message-error' : ''} phi-warning`.trim()}
              ></textarea>
              {errors.message && <p id="message-error" className="mt-1 text-sm text-error">{errors.message}</p>}
            </div>
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="consent" 
                  name="consent" 
                  type="checkbox" 
                  checked={formData.consent} 
                  onChange={handleChange} 
                  required 
                  className={`focus:ring-burgundy h-4 w-4 text-burgundy rounded ${errors.consent ? 'border-red-500' : 'border-slate-300'}`}
              aria-invalid={errors.consent ? "true" : "false"}
                  aria-describedby="consent-description"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-medium text-slate-700">I understand this form is not for PHI or medical emergencies.</label>
                <p id="consent-description" className="text-slate-500">For emergencies, please call 911.</p>
              </div>
            </div>
            {errors.consent && <p id="consent-error" className="-mt-4 text-sm text-error">{errors.consent}</p>}
            <div>
              <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-medium text-white bg-burgundy hover:bg-burgundy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burgundy disabled:bg-slate-400">
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {status === 'success' && <p className="text-center text-success" aria-live="polite">Thank you! Your message has been sent.</p>}
            {status === 'error' && <p className="text-center text-error" aria-live="polite">Something went wrong. Please try again.</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;