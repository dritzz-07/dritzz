import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import BookingForm from './components/BookingForm';
import WhyUs from './components/WhyUs';
import Testimonials from './components/Testimonials';
import ShowcaseVideo from './components/ShowcaseVideo';
import Footer from './components/Footer';
import PaymentModal from './components/PaymentModal';
import WaterSplashEffects from './components/WaterSplashEffects';
import AuthOverlay from './components/AuthOverlay';
import ProfileSetupOverlay from './components/ProfileSetupOverlay';
import MyBookingsModal from './components/MyBookingsModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { BookingDetails, VehicleType, Package } from './types';
import { PACKAGES } from './constants';

function MainApp() {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('hatchback');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<'upcoming' | 'history' | 'subscriptions'>('upcoming');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'addresses' | 'vehicles' | 'invoices' | 'support' | 'settings'>('settings');
  const [currentBookingDetails, setCurrentBookingDetails] = useState<BookingDetails | null>(null);
  const [currentPkg, setCurrentPkg] = useState<Package | null>(null);
  const [amount, setAmount] = useState(0);

  const handleSelectPackage = (pkgId: string, vehicle: VehicleType) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedVehicle(vehicle);
    setSelectedPkgId(pkgId);
    
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSubmit = (details: BookingDetails) => {
    const pkg = PACKAGES.find(p => p.id === details.packageId);
    if (!pkg) return;

    let totalPrice = 0;
    
    if (details.vehicles && details.vehicles.length > 0) {
      details.vehicles.forEach(v => {
         const pId = v.packageId || details.packageId || 'basic';
         const p = PACKAGES.find(x => x.id === pId) || pkg;
         totalPrice += p.price[v.type] || p.price['hatchback'];
      });
    } else {
      totalPrice = pkg.price[details.vehicleType || 'hatchback'];
    }
    
    if (details.vehicles && details.vehicles.length >= 3) {
      // Society offer: Book 3 Cars Together & Get Flat 20% OFF
      totalPrice = Math.round(totalPrice * 0.80);
    }
    
    setCurrentBookingDetails(details);
    setCurrentPkg(pkg);
    setAmount(totalPrice);
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* Global Deep Space Glow based on the reference image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>
      <div className="relative z-10 w-full h-full">
        <WaterSplashEffects />
        <Navbar 
          openLogin={() => { setIsAuthOpen(true); }} 
          openBookings={(tab = 'upcoming') => { setBookingsTab(tab); setIsBookingsOpen(true); }}
          openSettings={(tab = 'settings') => { setSettingsTab(tab); setIsSettingsOpen(true); }}
        />
        
        <main className="relative z-10">
          <Hero />
          <ShowcaseVideo />
          <HowItWorks />
          <Pricing 
            onSelectPackage={handleSelectPackage} 
          />
          <BookingForm 
            initialVehicle={selectedVehicle} 
            initialPackageId={selectedPkgId} 
            onSubmit={handleBookingSubmit} 
            onRequireAuth={() => { setIsAuthOpen(true); }}
          />
          <WhyUs />
          <Testimonials />
        </main>

        <Footer />

        <AuthOverlay 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
        />

        <ProfileSetupOverlay />

        <MyBookingsModal 
          isOpen={isBookingsOpen}
          onClose={() => setIsBookingsOpen(false)}
          initialTab={bookingsTab}
        />

        <AccountSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
        />

        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          bookingDetails={currentBookingDetails}
          pkg={currentPkg}
          amount={amount}
        />
      </div>
    </div>
  );
}

import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';
import ContactUs from './pages/ContactUs';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsConditions />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/contact-us" element={<ContactUs />} />
    </Routes>
  );
}

