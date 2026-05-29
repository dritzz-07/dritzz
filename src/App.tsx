import { useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Sparkles, Package as PackageIcon, Calendar } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

import { useAuth } from "./context/AuthContext";
import { BookingDetails, VehicleType, Package } from "./types";
import { PACKAGES } from "./constants";
import WaterSplashEffects from "./components/WaterSplashEffects";

const HowItWorks = lazy(() => import("./components/HowItWorks"));
const Pricing = lazy(() => import("./components/Pricing"));
const BookingForm = lazy(() => import("./components/BookingForm"));
const WhyUs = lazy(() => import("./components/WhyUs"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const ShowcaseVideo = lazy(() => import("./components/ShowcaseVideo"));
const Footer = lazy(() => import("./components/Footer"));
const PaymentModal = lazy(() => import("./components/PaymentModal"));
const AuthOverlay = lazy(() => import("./components/AuthOverlay"));
const ProfileSetupOverlay = lazy(
  () => import("./components/ProfileSetupOverlay"),
);
const MyBookingsModal = lazy(() => import("./components/MyBookingsModal"));
const AccountSettingsModal = lazy(
  () => import("./components/AccountSettingsModal"),
);
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const Services = lazy(() => import("./components/Services"));

const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

const LoadingFallback = () => (
  <div className="h-32 flex items-center justify-center text-white/50 text-sm tracking-widest uppercase">
    Loading section...
  </div>
);
const PageLoader = () => (
  <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center text-white/50 text-sm tracking-widest uppercase">
    Loading...
  </div>
);

function MainApp() {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleType>("hatchback");
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"home" | "services" | "packages" | "book">("home");

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingsTab, setBookingsTab] = useState<
    "upcoming" | "history" | "subscriptions"
  >("upcoming");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "addresses" | "vehicles" | "invoices" | "support" | "settings"
  >("settings");
  const [currentBookingDetails, setCurrentBookingDetails] =
    useState<BookingDetails | null>(null);
  const [currentPkg, setCurrentPkg] = useState<Package | null>(null);
  const [amount, setAmount] = useState(0);

  const handleSelectPackage = (pkgId: string, vehicle: VehicleType) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedVehicle(vehicle);
    setSelectedPkgId(pkgId);

    // On mobile, switch to book tab
    if (window.innerWidth < 768) {
      setMobileTab("book");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const bookingSection = document.getElementById("booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleBookingSubmit = (details: BookingDetails) => {
    const pkg = PACKAGES.find((p) => p.id === details.packageId);
    if (!pkg) return;

    let totalPrice = 0;

    if (details.vehicles && details.vehicles.length > 0) {
      details.vehicles.forEach((v) => {
        const pId = v.packageId || details.packageId || "basic";
        const p = PACKAGES.find((x) => x.id === pId) || pkg;
        totalPrice += p.price[v.type] || p.price["hatchback"];
      });
    } else {
      totalPrice = pkg.price[details.vehicleType || "hatchback"];
    }

    if (details.vehicles && details.vehicles.length >= 3) {
      // Society offer: Book 3 Cars Together & Get Flat 20% OFF
      totalPrice = Math.round(totalPrice * 0.8);
    }

    setCurrentBookingDetails(details);
    setCurrentPkg(pkg);
    setAmount(totalPrice);
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-white selection:text-black relative overflow-x-hidden pb-[80px] md:pb-0">
      {/* Global Deep Space Glow based on the reference image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vh] bg-[radial-gradient(circle_at_center,_rgba(25,35,65,0.4),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vh] bg-[radial-gradient(circle_at_center,_rgba(30,45,95,0.5),_transparent_70%)]" />
      </div>
      <div className="relative z-10 w-full h-full">
        <WaterSplashEffects />
        <Navbar
          openLogin={() => {
            setIsAuthOpen(true);
          }}
          openBookings={(tab = "upcoming") => {
            setBookingsTab(tab);
            setIsBookingsOpen(true);
          }}
          openSettings={(tab = "settings") => {
            setSettingsTab(tab);
            setIsSettingsOpen(true);
          }}
        />

        {/* Desktop View */}
        <main className="relative z-10 hidden md:block">
          <Hero />
          <Suspense fallback={<LoadingFallback />}>
            <ShowcaseVideo />
            <HowItWorks />
            <Services />
            <Pricing onSelectPackage={handleSelectPackage} />
            <BookingForm
              initialVehicle={selectedVehicle}
              initialPackageId={selectedPkgId}
              onSubmit={handleBookingSubmit}
              onRequireAuth={() => {
                setIsAuthOpen(true);
              }}
            />
            <WhyUs />
            <Testimonials />
          </Suspense>
        </main>

        {/* Mobile View (Tabbed) */}
        <main className="relative z-10 block md:hidden">
          <Suspense fallback={<LoadingFallback />}>
            {mobileTab === "home" && (
              <>
                <Hero />
                <ShowcaseVideo />
                <HowItWorks />
                <WhyUs />
                <Testimonials />
              </>
            )}
            {mobileTab === "services" && <Services />}
            {mobileTab === "packages" && <Pricing onSelectPackage={handleSelectPackage} />}
            {mobileTab === "book" && (
              <BookingForm
                initialVehicle={selectedVehicle}
                initialPackageId={selectedPkgId}
                onSubmit={handleBookingSubmit}
                onRequireAuth={() => {
                  setIsAuthOpen(true);
                }}
              />
            )}
          </Suspense>
        </main>

        {/* Footer */}
        <div className="hidden md:block">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
        <div className="block md:hidden">
          {mobileTab === "home" && (
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-[100] flex items-center justify-around px-2 sm:px-6 lg:px-8 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent" style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(80px + env(safe-area-inset-bottom))' }}>
          <button
            onClick={() => {
              setMobileTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative flex flex-col items-center justify-center w-full max-w-[80px] h-[80px] gap-1.5 transition-all duration-300"
          >
            {mobileTab === "home" && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-b-full"></div>
            )}
            <div className={`p-2 rounded-xl transition-all duration-300 ${mobileTab === "home" ? "bg-white/10 text-white scale-110 animate-diamond-shine" : "text-gray-400 group-hover:text-white group-hover:bg-white/5"}`}>
              <Home className={`w-[22px] h-[22px] ${mobileTab === "home" ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`} strokeWidth={mobileTab === "home" ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-[0.1em] transition-all duration-300 ${mobileTab === "home" ? "text-white text-diamond-shine" : "text-gray-500"}`}>Home</span>
          </button>
          
          <button
            onClick={() => {
              setMobileTab("services");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative flex flex-col items-center justify-center w-full max-w-[80px] h-[80px] gap-1.5 transition-all duration-300"
          >
             {mobileTab === "services" && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-b-full"></div>
            )}
            <div className={`p-2 rounded-xl transition-all duration-300 ${mobileTab === "services" ? "bg-white/10 text-white scale-110 animate-diamond-shine" : "text-gray-400 group-hover:text-white group-hover:bg-white/5"}`}>
              <Sparkles className={`w-[22px] h-[22px] ${mobileTab === "services" ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`} strokeWidth={mobileTab === "services" ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-[0.1em] transition-all duration-300 ${mobileTab === "services" ? "text-white text-diamond-shine" : "text-gray-500"}`}>Services</span>
          </button>

          <button
            onClick={() => {
              setMobileTab("packages");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative flex flex-col items-center justify-center w-full max-w-[80px] h-[80px] gap-1.5 transition-all duration-300"
          >
             {mobileTab === "packages" && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-b-full"></div>
            )}
            <div className={`p-2 rounded-xl transition-all duration-300 ${mobileTab === "packages" ? "bg-white/10 text-white scale-110 animate-diamond-shine" : "text-gray-400 group-hover:text-white group-hover:bg-white/5"}`}>
              <PackageIcon className={`w-[22px] h-[22px] ${mobileTab === "packages" ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`} strokeWidth={mobileTab === "packages" ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-[0.1em] transition-all duration-300 ${mobileTab === "packages" ? "text-white text-diamond-shine" : "text-gray-500"}`}>Packages</span>
          </button>

          <button
            onClick={() => {
              setMobileTab("book");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative flex flex-col items-center justify-center w-full max-w-[80px] h-[80px] gap-1.5 transition-all duration-300"
          >
             {mobileTab === "book" && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-b-full"></div>
            )}
            <div className={`p-2 rounded-xl transition-all duration-300 ${mobileTab === "book" ? "bg-white/10 text-white scale-110 animate-diamond-shine" : "text-gray-400 group-hover:text-white group-hover:bg-white/5"}`}>
              <Calendar className={`w-[22px] h-[22px] ${mobileTab === "book" ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`} strokeWidth={mobileTab === "book" ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-[0.1em] transition-all duration-300 ${mobileTab === "book" ? "text-white text-diamond-shine" : "text-gray-500"}`}>Book</span>
          </button>
        </div>

        <Suspense fallback={null}>
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
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </Suspense>
  );
}

