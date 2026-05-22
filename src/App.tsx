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
import MyBookingsModal from './components/MyBookingsModal';
import AdminDashboard from './components/AdminDashboard';
import { BookingDetails, VehicleType, Package } from './types';
import { PACKAGES } from './constants';

function MainApp() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('hatchback');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentBookingDetails, setCurrentBookingDetails] = useState<BookingDetails | null>(null);
  const [currentPkg, setCurrentPkg] = useState<Package | null>(null);
  const [amount, setAmount] = useState(0);

  const handleSelectPackage = (pkgId: string, vehicle: VehicleType) => {
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
    <div className="min-h-screen selection:bg-gold selection:text-black">
      <WaterSplashEffects />
      <Navbar 
        openLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }} 
        openSignup={() => { setAuthMode('signup'); setIsAuthOpen(true); }} 
        openBookings={() => setIsBookingsOpen(true)}
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
          onRequireAuth={() => { setAuthMode('login'); setIsAuthOpen(true); }}
        />
        <WhyUs />
        <Testimonials />
      </main>

      <Footer />

      <AuthOverlay 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
      />

      <MyBookingsModal 
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
      />

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        bookingDetails={currentBookingDetails}
        pkg={currentPkg}
        amount={amount}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

