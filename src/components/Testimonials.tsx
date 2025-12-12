

import React, { useState } from 'react';
import { QuoteIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const testimonials = [
  {
    quote: "The pharmacists here are incredibly knowledgeable and caring. They always take the time to answer my questions.",
    name: "Sarah L.",
    avatarUrl: "https://iili.io/Ktj5Egf.jpg",
  },
  {
    quote: "Switching to Elevated Wellness was the best decision. The med sync service has made managing my prescriptions so much easier.",
    name: "Michael B.",
    avatarUrl: "https://iili.io/Ktj5XbS.jpg",
  },
  {
    quote: "I'm so grateful for their fast local delivery service. It's a lifesaver for me, and the drivers are always so friendly.",
    name: "Janet P.",
    avatarUrl: "https://iili.io/Ktj510G.jpg",
  },
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-pearl" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="testimonials-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What Our Patients Are Saying
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Real stories from our valued community members.
          </p>
        </div>
        
        <div className="mt-12 relative max-w-2xl mx-auto" role="region" aria-label="Patient Testimonials carousel">
          <div className="w-full overflow-hidden">
            <div
              className="flex flex-nowrap w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              aria-live="polite"
              data-current-index={currentIndex}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
                >
                  <div className="mx-auto bg-white p-8 rounded-2xl shadow-sm flex flex-col max-w-xl">
                    <div className="flex items-start">
                      <QuoteIcon className="h-8 w-8 text-rose-light shrink-0" aria-hidden="true" />
                      <p className="ml-4 text-lg italic text-slate-700">"{testimonial.quote}"</p>
                    </div>
                    <div className="mt-6 flex items-center justify-end">
                      <p className="font-semibold text-burgundy">{testimonial.name}</p>
                      <img
                        src={testimonial.avatarUrl}
                        alt={`Avatar of ${testimonial.name}`}
                        className="ml-4 h-12 w-12 rounded-full object-cover shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 text-slate-600 hover:text-burgundy transition-colors shadow-md z-10"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 text-slate-600 hover:text-burgundy transition-colors shadow-md z-10"
          >
            <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="mt-8 flex justify-center space-x-2" role="tablist" aria-label="Testimonial slides">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                role="tab"
                aria-selected={currentIndex === index ? "true" : "false"}
                className={`h-3 w-3 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-burgundy' : 'bg-rose-light hover:bg-rose-mist'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;