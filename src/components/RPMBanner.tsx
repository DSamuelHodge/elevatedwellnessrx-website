

import React from 'react';

interface RPMBannerProps {
  onJoinWaitlistClick: () => void;
}

const RPMBanner: React.FC<RPMBannerProps> = ({ onJoinWaitlistClick }) => {
  return (
    <section id="rpm" className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Remote Patient Monitoring: Coming Soon!
            </h2>
            <p className="mt-4 text-lg text-rose-mist/80">
              Take control of your health from the comfort of your home. Our upcoming RPM service will connect you with our pharmacists for proactive, personalized care.
            </p>
            <ul className="mt-6 space-y-3 text-rose-mist">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-rose-light mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>BP & Glucose devices delivered to you</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-rose-light mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Timely reminders and health insights</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-rose-light mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Direct oversight from our expert pharmacy team</span>
              </li>
            </ul>
            <div className="mt-8">
              <button
                type="button"
                onClick={onJoinWaitlistClick}
                className="inline-block bg-white text-burgundy font-semibold px-8 py-3 rounded-2xl hover:bg-rose-mist transition-colors shadow-lg"
              >
                Join the Waitlist
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://iili.io/KZbY0wN.png" 
              alt="Dexcom GCM digital health device" 
              className="rounded-2xl shadow-2xl" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RPMBanner;