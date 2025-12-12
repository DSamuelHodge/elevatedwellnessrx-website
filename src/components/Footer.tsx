

import React from 'react';

interface FooterProps {
  navigateTo: (page: 'home' | 'about', anchor?: string) => void;
  onOpenHipaaModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo, onOpenHipaaModal }) => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();

    if (href.startsWith('#')) {
      const anchor = href.substring(1);
      navigateTo('home', anchor);
    } else {
      navigateTo('about');
    }
  };

  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateTo('home');
  };
  
  const handleHipaaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onOpenHipaaModal();
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
             <a href="/" onClick={handleHomeClick} className="flex items-center space-x-3" aria-label="Complete Healthcare Rx Home">
              <img src="https://iili.io/f7esH8u.png" alt="Complete Healthcare Rx Logo" className="h-10 w-auto rounded-md bg-white p-1" />
              <span className="text-xl tracking-tight text-white">
                <span className="font-bold">Complete</span>Healthcare Rx
              </span>
            </a>
            <p className="text-rose-mist/70">Your trusted partner in health and wellness in West Columbus.</p>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="transition-colors hover:text-rose-light">Services</a></li>
              <li><a href="about" onClick={(e) => handleNavClick(e, 'about')} className="transition-colors hover:text-rose-light">About Us</a></li>
              <li><a href="#rpm" onClick={(e) => handleNavClick(e, '#rpm')} className="transition-colors hover:text-rose-light">RPM</a></li>
              <li><a href="#location" onClick={(e) => handleNavClick(e, '#location')} className="transition-colors hover:text-rose-light">Hours & Location</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="transition-colors hover:text-rose-light">Contact Us</a></li>
            </ul>
          </nav>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-rose-mist/70">
              <li>1539 W Broad St Suite C, Columbus, OH 43222</li>
              <li><a href="tel:614-349-5140" className="transition-colors hover:text-rose-light">(614) 349-5140</a></li>
              <li><a href="mailto:pharmacy@completehealthcarerx.com" className="transition-colors hover:text-rose-light">pharmacy@completehealthcarepharmacy.com</a></li>
            </ul>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {currentYear} <span className="font-bold">Complete</span>Healthcare Rx. All Rights Reserved.</p>
          <p className="mt-2"><a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-rose-light">Privacy Policy</a> &middot; <a href="#hipaa" onClick={handleHipaaClick} className="hover:text-rose-light">HIPAA Notice</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;