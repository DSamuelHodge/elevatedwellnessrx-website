import React from 'react';

const insuranceProviders = [
  { name: 'Medicaid', logoUrl: 'https://iili.io/KDhk70N.png' },
  { name: 'Anthem', logoUrl: 'https://cdn.worldvectorlogo.com/logos/anthem-inc-logo.svg' },
  { name: 'UnitedHealthcare', logoUrl: 'https://iili.io/KDa5ETF.png' },
  { name: 'Cigna', logoUrl: 'https://iili.io/KDa5Ghg.png' },
  { name: 'Aetna', logoUrl: 'https://iili.io/KDYmflS.jpg' },
];

const Insurance: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-cream/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            We Accept Most Major Plans
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Including Medicare, Medicaid, and private insurance. We also accept cash, HSA, and FSA payments for your convenience.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
          {insuranceProviders.map((provider) => (
            <div key={provider.name} className="flex justify-center">
              <img
                src={provider.logoUrl}
                alt={`${provider.name} logo`}
                className="h-10 w-auto filter grayscale opacity-70"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Insurance;