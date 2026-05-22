import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Chrome, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
         setError(`This domain (${window.location.hostname}) is not authorized for Google OAuth inside your Firebase project. Please add it in the Firebase Console under Authentication > Settings > Authorized domains.`);
      } else if (err?.code === 'auth/popup-closed-by-user') {
         setError('Sign in cancelled.');
      } else if (err?.code === 'auth/network-request-failed') {
         setError('Network request failed. If you are using a preview environment in an iframe or an ad-blocker, try opening the app in a new tab.');
      } else {
         setError(err.message || 'Failed to login with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[440px] bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>

            <div className="p-8 pt-12">
              <div className="mb-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <LogIn className="w-8 h-8 text-black" />
                </div>
                
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">
                  WELCOME
                </h2>
                <p className="text-neutral-500 text-sm">
                  Premium car care is just a sign-in away.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs"
                >
                  <AlertCircle className="w-4 h-4 min-w-[16px]" />
                  <span className="break-words">{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4" />
                  {isLoading ? 'Processing...' : 'Continue with Google'}
                </button>
              </div>
            </div>
            
            <div className="bg-white/5 p-6 text-center border-t border-white/5 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-white/40" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-white/40">
                Encrypted & Secure with Firebase
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
