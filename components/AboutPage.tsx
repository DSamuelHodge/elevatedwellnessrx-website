import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <main id="about" className="py-16 md:py-24 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Redefining the Pharmacy Experience
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Complete Healthcare Rx was created to change the way traditional pharmacy is viewed — shifting from a transactional model to one centered on total patient wellness. Our mission is to elevate the pharmacy experience by combining compassionate care with innovative clinical programs that help patients take control of their health.
            </p>
          </div>

          <div className="mt-12 text-lg text-slate-600 space-y-6">
            <p>
              At Complete Healthcare Rx, we believe that a pharmacy should be more than just a place to pick up prescriptions — it should be a partner in your health journey. That’s why we’ve integrated advanced programs such as Remote Patient Monitoring (RPM), Medication Therapy Management (MTM), and Chronic Care Management (CCM) to support patients beyond the counter. These services allow us to work hand-in-hand with providers to ensure better outcomes, improved medication adherence, and a higher quality of life for every individual we serve.
            </p>
            <p>
              We are especially committed to serving the populations often neglected the most — the Medicare and Medicaid communities. Through personalized delivery services, customized pill boxes, and ongoing care coordination, we remove barriers to access and provide the consistency patients need to stay healthy and independent.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div className="md:col-span-1">
              <img 
                src="https://iili.io/KDZtZib.png" 
                alt="Nick Knight, Founder of Complete Healthcare Rx" 
                className="rounded-2xl shadow-lg w-full object-cover aspect-[4/5]"
              />
            </div>
            <div className="md:col-span-2">
              <blockquote className="border-l-4 border-burgundy pl-6 text-xl italic text-slate-700 font-semibold">
                "At Complete Healthcare Rx, our goal is simple: to elevate healthcare by delivering pharmacy services that are proactive, personal, and purposeful."
              </blockquote>
              <p className="mt-4 text-right font-bold text-slate-900">
                — Nick Knight
              </p>
              <p className="text-right text-slate-600">
                Founder of Complete Healthcare Rx
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
