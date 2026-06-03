import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function TermsConditions() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<'upcoming' | 'history' | 'subscriptions'>('upcoming');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'addresses' | 'vehicles' | 'invoices' | 'support' | 'settings'>('settings');

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-white selection:text-black relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col min-h-screen">
        <Navbar 
          openLogin={() => { setIsAuthOpen(true); }} 
          openBookings={(tab = 'upcoming') => { setBookingsTab(tab); setIsBookingsOpen(true); }}
          openSettings={(tab = 'settings') => { setSettingsTab(tab); setIsSettingsOpen(true); }}
        />
        
        <main className="flex-grow pt-40 md:pt-48 pb-20 px-4 md:px-8 max-w-3xl mx-auto w-full">
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">Terms & Conditions</h1>
          <div className="space-y-6 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Service Usage Terms</h2>
              <p>By accessing and using Dritzz properties, you agree to comply with all operational policies and legal constraints. The platform is designed for individuals seeking premium vehicle detailing and washing services.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Booking Rules</h2>
              <p>Creating a booking confirms a request for service. Confirmation is subject to slot availability in your area. We require reasonable access and sufficient space around your vehicle to efficiently enact our cleaning services.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Cancellation and Refund Policy</h2>
              <p>Bookings may be cancelled or rescheduled up to 4 hours in advance at no penalty. Cancellations made within the 4-hour window may be subject to a nominal fee. Approved refunds are processed back to the original method of payment within 5-7 business days.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">User Responsibilities</h2>
              <p>Customers must secure their private valuables from their vehicles prior to our team's arrival. Users are also responsible for guaranteeing the service site is accessible as scheduled to avoid delays or service skips.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Limitation of Liability</h2>
              <p>While our teams practice the utmost diligence, Dritzz limits liability regarding pre-existing vehicle defects, dents, or pre-worn materials exacerbated during a normal wash cycle. Our liability is restricted to the cost of the booked service.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Contact Us</h2>
              <p>For any disputes, legal notices, or general inquiries regarding these terms, contact us immediately at: <a href="mailto:support@dritzz.com" className="text-white hover:underline">support@dritzz.com</a></p>
            </div>
          </div>
        </main>

        <Footer />

        <AuthOverlay isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <MyBookingsModal isOpen={isBookingsOpen} onClose={() => setIsBookingsOpen(false)} initialTab={bookingsTab} />
        <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab={settingsTab} />
      </div>
    </div>
  );
}
