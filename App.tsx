import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Pillars from './components/Pillars';
import AboutPage from './components/AboutPage';
import RPMBanner from './components/RPMBanner';
import Insurance from './components/Insurance';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WaitlistModal from './components/WaitlistModal';
import HipaaModal from './components/HipaaModal';
import RefillRequestModal from './components/RefillRequestModal';
import TransferRequestModal from './components/TransferRequestModal'; // Import the new modal
import SplashModal from './components/SplashModal'; // Import the new SplashModal

const App: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isHipaaModalOpen, setIsHipaaModalOpen] = useState(false);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [isSplashModalOpen, setIsSplashModalOpen] = useState(false); // State for Splash modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); // New state for Transfer modal
  const [page, setPage] = useState<'home' | 'about'>('home');
  const [scrollToAnchor, setScrollToAnchor] = useState<string | null>(null);
  
  useEffect(() => {
  const hasDismissed = sessionStorage.getItem('splashModalDismissed');
  if (!hasDismissed) {
    // Add a small delay to allow the page to render first
    const timer = setTimeout(() => {
      setIsSplashModalOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }
}, []);
  
  useEffect(() => {
    // This effect runs after the page state changes. If we've navigated to the home page
    // and an anchor is specified, it waits for the DOM to update and then scrolls.
    if (page === 'home' && scrollToAnchor) {
      setTimeout(() => {
        const targetElement = document.getElementById(scrollToAnchor);
        if (targetElement) {
          const headerOffset = 80; // height of the sticky header
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
        setScrollToAnchor(null); // Reset the anchor after scrolling
      }, 100);
    }
  }, [page, scrollToAnchor]);

  const navigateTo = (targetPage: 'home' | 'about', anchor?: string) => {
    if (page !== targetPage) {
      setPage(targetPage);
    }
    
    if (anchor) {
      setScrollToAnchor(anchor);
    } else if (page === targetPage) {
      // If we're already on the target page without an anchor, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
       // For a simple page change, scroll to top instantly
       window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleOpenWaitlistModal = () => setIsWaitlistModalOpen(true);
  const handleCloseWaitlistModal = () => setIsWaitlistModalOpen(false);
  
  const handleOpenHipaaModal = () => setIsHipaaModalOpen(true);
  const handleCloseHipaaModal = () => setIsHipaaModalOpen(false);

  const handleOpenRefillModal = () => setIsRefillModalOpen(true);
  const handleCloseRefillModal = () => setIsRefillModalOpen(false);

  // New handlers for Transfer modal
  const handleOpenTransferModal = () => setIsTransferModalOpen(true);
  const handleCloseTransferModal = () => setIsTransferModalOpen(false);

    // Handler for Splash modal
  const handleCloseSplashModal = () => {
    sessionStorage.setItem('splashModalDismissed', 'true');
    setIsSplashModalOpen(false);
  };

  return (
    <div className="bg-pearl text-slate-600 font-sans">
      <Header navigateTo={navigateTo} onOpenRefillModal={handleOpenRefillModal} />
        {page === 'home' ? (
          <main>
            <Hero onOpenRefillModal={handleOpenRefillModal} onOpenTransferModal={handleOpenTransferModal} />
            <Pillars />
            <RPMBanner onJoinWaitlistClick={handleOpenWaitlistModal} />
            <Insurance />
            <Testimonials />
            <Location />
            <Contact />
          </main>
        ) : (
          <AboutPage />
        )}
      <Footer navigateTo={navigateTo} onOpenHipaaModal={handleOpenHipaaModal} />
      <WaitlistModal isOpen={isWaitlistModalOpen} onClose={handleCloseWaitlistModal} />
      <HipaaModal isOpen={isHipaaModalOpen} onClose={handleCloseHipaaModal} />
      <RefillRequestModal isOpen={isRefillModalOpen} onClose={handleCloseRefillModal} />
      <SplashModal isOpen={isSplashModalOpen} onClose={handleCloseSplashModal} />
      {/* Render the new TransferRequestModal */}
      <TransferRequestModal isOpen={isTransferModalOpen} onClose={handleCloseTransferModal} />
    </div>
  );
};

export default App;
