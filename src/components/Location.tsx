import React from 'react';

const Location: React.FC = () => {
  const address = "1539 W Broad St Suite C, Columbus, OH 43222";
  const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="location" className="bg-pearl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Visit Us in West Columbus
            </h2>
            <div className="mt-6 space-y-4 text-lg text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900">Address</h3>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-burgundy transition-colors">
                  {address}
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Phone</h3>
                <a href="tel:614-370-1048" className="hover:text-burgundy transition-colors">(614) 370-1048</a>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Hours</h3>
                <ul className="list-none">
                  <li><span className="w-20 inline-block">Mon–Fri:</span> 9:00 AM – 6:00 PM</li>
                  <li><span className="w-20 inline-block">Saturday:</span> 10:00 AM – 2:00 PM</li>
                  <li><span className="w-20 inline-block">Sunday:</span> Closed</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="h-80 md:h-full w-full rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              className="location-iframe"
              allowFullScreen={false}
              loading="lazy"
              title="Pharmacy Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
