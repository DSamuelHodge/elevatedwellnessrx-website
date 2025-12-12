import React from 'react';
// Removed specific icon imports as they are being replaced by images

const pillars = [
  {
    imageUrl: 'https://iili.io/KthZDZJ.jpg',
    title: 'Fast Refills',
    description: 'Quick and easy prescription refills to get you on your way sooner.',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    title: 'Med Sync',
    description: 'Align all your prescriptions to be refilled on the same day each month.',
  },
  {
    imageUrl: 'https://iili.io/KthU4R4.png',
    title: 'Immunizations',
    description: 'Stay protected with flu shots, travel vaccines, and more.',
  },
  {
    imageUrl: 'https://iili.io/KthZZTg.jpg',
    title: 'Adherence Packaging',
    description: 'Pre-sorted pill packs to help you take the right medication at the right time.',
  },
  {
    imageUrl: 'https://iili.io/KthUUUG.png',
    title: 'Wellness & OTC',
    description: 'A curated selection of over-the-counter products and wellness advice.',
  },
  {
    imageUrl: 'https://iili.io/KthZtja.jpg',
    title: 'Local Delivery',
    description: 'Convenient and reliable prescription delivery to your doorstep.',
  },
];

const Pillars: React.FC = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-pearl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Care Centered Around You
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            We provide a wide range of services to simplify your health journey.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            return (
              <div key={pillar.title} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-burgundy">
                <div className="relative h-32 w-full mb-6 overflow-hidden rounded-lg">
                   <img src={pillar.imageUrl} alt={pillar.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out scale-110 group-hover:scale-100" />
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-2 text-base text-slate-600">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pillars;