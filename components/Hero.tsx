import React from 'react';

interface HeroProps {
  onOpenRefillModal: () => void;
  onOpenTransferModal: () => void; // New prop for opening transfer modal
}

const Hero: React.FC<HeroProps> = ({ onOpenRefillModal, onOpenTransferModal }) => {
  return (
    <section className="bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
          Elevated Wellness <span className="text-burgundy">Pharmacy</span> for Personalized Care, Prescriptions & Wellness
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600">
          Your local, independent pharmacy dedicated to personalized care. We offer fast, friendly service to help you manage your health with confidence.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenRefillModal}
            className="w-full sm:w-auto bg-burgundy text-white font-semibold px-8 py-3 rounded-2xl hover:bg-burgundy-dark transition-all transform hover:scale-105 shadow-lg"
          >
            Refill Request
          </button>
          <button
            onClick={onOpenTransferModal} // Trigger the new transfer modal
            className="w-full sm:w-auto bg-transparent text-burgundy font-semibold px-8 py-3 rounded-2xl hover:bg-rose-mist transition-all border border-burgundy"
          >
            Transfer a Prescription
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
