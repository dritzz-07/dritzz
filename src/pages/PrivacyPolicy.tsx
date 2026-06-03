import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthOverlay from '../components/AuthOverlay';
import MyBookingsModal from '../components/MyBookingsModal';
import AccountSettingsModal from '../components/AccountSettingsModal';

export default function PrivacyPolicy() {
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
          <h1 className="text-2xl md:text-3xl font-light mb-12 uppercase tracking-[0.2em] text-white/90">Privacy Policy</h1>
          <div className="space-y-6 text-neutral-400 font-light text-sm md:text-base leading-relaxed">
            <p>At Dritzz, we prioritize the protection of your personal information and privacy. This Privacy Policy details how we collect, use, and safeguard your data.</p>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-12 mb-4">Information Collected from Users</h2>
              <p>We collect essential information such as your name, email address, and service locations to provide a seamless scheduling and service execution experience.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Google Sign-In Authentication</h2>
              <p>When you choose to securely sign in or register with your Google account, we access only the minimum requisite profile details (such as your verified email and name) to streamline your access. Your Google credentials are never stored on our servers.</p>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Phone Number Authentication</h2>
              <p>For secure access to your account and to verify service addresses efficiently, we utilize Phone OTP authentication. We do not use your phone number for unsolicited marketing without consent.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Booking and Payment Information</h2>
              <p>We securely store your vehicle models and historical booking details to refine your experience. Payments are processed over a secure gateway. Dritzz does not persist your sensitive financial data or full credit card numbers.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Cookies and Analytics</h2>
              <p>We utilize standard cookies and analytical tools to understand website traffic, measure performance, and enhance platform usablity. You may configure your browser to decline cookies, though some platform features may become unavailable.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Data Security</h2>
              <p>Your data is insulated using standard industry encryption protocols and security practices to prevent unauthorized access, alteration, or data leaks.</p>
            </div>
            
            <div>
              <h2 className="text-xs font-semibold text-white/80 uppercase tracking-widest mt-10 mb-4">Contact Us</h2>
              <p>If you have any questions or concerns regarding our privacy practices, please contact us at: <a href="mailto:support@dritzz.com" className="text-white hover:underline">support@dritzz.com</a></p>
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
