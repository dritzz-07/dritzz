import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  openLogin: () => void;
  openSignup: () => void;
  openBookings: () => void;
}

export default function Navbar({ openLogin, openSignup, openBookings }: NavbarProps) {
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNavClick = (e: React.MouseEvent) => {
    const splash = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
    setSplashes(prev => [...prev, splash]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => s.id !== splash.id));
    }, 1000);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-16 bg-black/80 backdrop-blur-sm border-b border-white/5">
      <a href="#" className="flex items-center gap-2 decoration-none text-white group" onClick={handleNavClick}>
        <motion.img 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          src="/logo_v2.svg" 
          alt="Dritzz Logo" 
          className="h-12 w-auto transition-all" 
        />
      </a>
      
      <ul className="hidden md:flex items-center gap-10 list-none">
        {['Packages', 'How It Works', 'Why Us', 'Contact'].map((item) => (
          <li key={item}>
            <a 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
              onClick={handleNavClick}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors decoration-none relative"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      <div className="hidden md:flex items-center gap-6">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full p-1 text-white/50" />
                )}
              </div>
              <span className="text-xs font-bold text-white max-w-[100px] truncate">
                {user.displayName?.split(' ')[0] || 'User'}
              </span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-48 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Logged in as</p>
                    <p className="text-xs text-white font-bold truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { openBookings(); setShowProfileMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-white hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-white/5 mb-1"
                  >
                    My Bookings
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <button 
              onClick={openLogin}
              className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              Log In
            </button>
            <motion.button 
              onClick={openSignup}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 transition-all uppercase tracking-widest"
            >
              Sign Up
            </motion.button>
          </>
        )}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[60]">
        <AnimatePresence>
          {splashes.map(splash => (
            <div key={splash.id} className="absolute" style={{ left: splash.x, top: splash.y }}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: 0,
                    x: (Math.random() - 0.5) * 150,
                    y: (Math.random() - 0.5) * 150,
                    scale: 0,
                    rotate: Math.random() * 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute"
                >
                  <Droplets size={20} className="text-blue-400 fill-blue-400/40 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>
    </nav>
  );
}
