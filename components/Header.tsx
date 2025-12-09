import React, { useState } from 'react';
import { MenuIcon, XIcon } from './icons';

interface HeaderProps {
  navigateTo: (page: 'home' | 'about', anchor?: string) => void;
  onOpenRefillModal: () => void; // New prop for opening refill modal
}

const Header: React.FC<HeaderProps> = ({ navigateTo, onOpenRefillModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'About', href: 'about' },
    { name: 'RPM', href: '#rpm' },
    { name: 'Location', href: '#location' },
    { name: 'Contact', href: '#contact' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    
    if (href.startsWith('#')) {
      const anchor = href.substring(1);
      navigateTo('home', anchor);
    } else {
      navigateTo('about');
    }
    
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateTo('home');
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const handleRefillTransferClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onOpenRefillModal(); // Open the new refill modal
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  return (
    <header className="bg-pearl/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="/" onClick={handleHomeClick} className="flex items-center space-x-3" aria-label="Complete Healthcare Rx Home">
            <img src="https://iili.io/fR5lc41.jpg" alt="Complete Healthcare Rx Logo" className="h-10 w-auto" />
            <span className="hidden md:inline text-xl text-slate-900 tracking-tight">
              <span className="font-bold">Elevated</span>Wellness Rx
            </span>
          </a>
          <nav aria-label="Main navigation" className="hidden md:flex items-center">
            <ul className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href.startsWith('#') ? link.href : `/${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-slate-700 hover:text-burgundy transition-colors font-semibold"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
               <li>
                 {/* Update Refill/Transfer button to open the modal */}
                 <a href="#" onClick={handleRefillTransferClick} className="ml-4 bg-burgundy text-white font-semibold px-4 py-2 rounded-lg hover:bg-burgundy-dark transition-colors shadow-sm">
                  Refill/Transfer
                </a>
               </li>
            </ul>
          </nav>
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-label="Toggle main menu"
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
              className="p-2 rounded-md text-slate-700 hover:bg-rose-mist"
            >
              {isMobileMenuOpen ? <XIcon className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="md:hidden bg-pearl border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <ul className="flex flex-col items-start space-y-1">
              {navLinks.map((link) => (
                <li key={link.name} className="w-full">
                  <a
                    href={link.href.startsWith('#') ? link.href : `/${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block rounded-md px-3 py-2 text-left font-semibold text-slate-700 transition-colors hover:text-burgundy"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
               <li className="w-full">
                {/* Update Refill/Transfer button in mobile menu to open the modal */}
                <a href="#" onClick={handleRefillTransferClick} className="mt-2 block w-full rounded-lg bg-burgundy px-4 py-2 text-center font-semibold text-white shadow-sm transition-colors hover:bg-burgundy-dark">
                  Refill/Transfer
                </a>
               </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;