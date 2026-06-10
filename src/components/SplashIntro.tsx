import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";

interface SplashIntroProps {
  onComplete: () => void;
}

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Elegant reveal of skip button after 1.5 seconds so as not to distract immediately
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);

    // Hard fallback timeout: if video doesn't end or fails to load, proceed after 6 seconds
    const fallbackTimer = setTimeout(() => {
      console.log("SplashIntro: Fallback timer triggered - proceeding to content.");
      onComplete();
    }, 6500);

    // Attempt autoplay upon mount
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay blocked or failed:", err);
        // Do not immediately fail; let the video try to load or let the fallback trigger
      });
    }

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    console.error("SplashIntro: Video loading failed or file is empty.");
    setVideoError(true);
    // Wait briefly for a smooth transition before proceeding if file is invalid
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#060606] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.035),_transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full h-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4">
        {/* Render actual video if no error occurred */}
        {!videoError ? (
          <div className="relative w-full aspect-video md:max-h-[70vh] rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-2xl backdrop-blur-3xl transition-all duration-700">
            {/* Visual pulsing shimmer during load */}
            {!videoLoaded && (
              <div className="absolute inset-0 bg-[#060606] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 border-t-white/80 animate-spin" />
                <span className="text-[10px] tracking-[0.4em] font-medium text-white/40 uppercase">
                  Initializing Intro
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              src="/My Video1.mp4"
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                videoLoaded ? "opacity-100" : "opacity-0"
              }`}
              muted
              autoPlay
              playsInline
              webkit-playsinline="true"
              onEnded={onComplete}
              onLoadedData={handleVideoLoadedData}
              onError={handleVideoError}
              controls={false}
            />
          </div>
        ) : (
          /* High-end design layout if video error, e.g. empty user file placeholder */
          <div className="flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white/80 animate-pulse" />
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-white/10 to-transparent blur-sm opacity-50" />
              </div>
              <h1 className="text-white text-lg font-bold tracking-[0.4em] uppercase mb-2">
                DRITZZ
              </h1>
              <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase max-w-sm mx-auto font-medium">
                India's Smartest Doorstep Car Wash Service
              </p>
            </motion.div>

            <div className="w-[120px] h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 w-1/2 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Elegant modern Skip button */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              id="skip-intro-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              onClick={onComplete}
              className="absolute bottom-10 right-6 md:right-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-white">
                Skip Intro
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-transform duration-300 group-hover:translate-x-0.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
