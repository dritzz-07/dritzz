import { motion, AnimatePresence } from "motion/react";
import { Star, Droplets, Zap } from "lucide-react";
import React, { useRef, useState, useEffect, memo } from "react";

const BG_IMAGES = [
  "/hero-image-1.webp",
  "/hero-image-2.webp",
];

const Hero = memo(function Hero() {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % BG_IMAGES.length);
    }, 4000); // Faster transition
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full flex flex-col bg-[#0a0a0a] text-center pt-[70px] lg:pt-[90px]">
      {/* Slideshow Area */}
      <div className="relative w-full aspect-[16/9] md:aspect-[1918/636] overflow-hidden pointer-events-none z-0">
        <AnimatePresence>
          <motion.img
            key={`hero-img-${currentImageIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            src={BG_IMAGES[currentImageIdx]}
            alt="Premium Car Detailing"
            className="absolute inset-0 w-full h-full object-cover lg:object-center object-center"
          />
        </AnimatePresence>
        {/* Dark Overlay for blending with text area below */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0a]" />
      </div>

      {/* Text Section Below */}
      <div 
        className="relative z-20 px-6 max-w-5xl mx-auto w-full flex flex-col items-center justify-center flex-1 gap-3 lg:gap-4 py-8 md:py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white text-[8px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase shadow-2xl mb-2"
        >
          Now Serving Hyderabad
        </motion.div>

        <motion.h1 className="font-sporty font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tighter uppercase select-none flex flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-1 text-center text-white drop-shadow-2xl">
          {["India’s", "Smartest", "Doorstep", "Car", "Wash", "Services"].map(
            (word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.1,
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                }}
                className="inline-block drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70"
              >
                {word}
              </motion.span>
            )
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-[9px] sm:text-[10px] md:text-xs text-neutral-300 leading-relaxed max-w-sm font-medium mt-1 text-center drop-shadow-md"
        >
          Professional Detailing at your home, office, or apartment. Fast,
          affordable, and spotless.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 sm:mt-6 w-full mx-auto"
        >
          <motion.div
            animate={{
              y: [0, -3, 0],
              boxShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "0 15px 30px rgba(0,0,0,0.4)",
                "0 0 0px rgba(0,0,0,0)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-start gap-4 bg-[#111111]/90 backdrop-blur-2xl border border-white/20 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl w-full sm:w-auto text-left shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/30 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-blue-300 font-bold leading-tight mb-1">
                We use our own
              </span>
              <span className="text-[14px] sm:text-[18px] uppercase tracking-wider text-white font-black leading-tight drop-shadow-lg">
                Water
              </span>
            </div>
          </motion.div>

          <motion.div
            animate={{
              y: [0, -3, 0],
              boxShadow: [
                "0 0 0px rgba(0,0,0,0)",
                "0 15px 30px rgba(0,0,0,0.4)",
                "0 0 0px rgba(0,0,0,0)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="flex items-center justify-start gap-4 bg-[#111111]/90 backdrop-blur-2xl border border-white/20 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl w-full sm:w-auto text-left shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/15 flex items-center justify-center border border-yellow-500/30 shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[9px] sm:text-[11px] uppercase tracking-[0.25em] text-yellow-500 font-bold leading-tight mb-1">
                We use our own
              </span>
              <span className="text-[14px] sm:text-[18px] uppercase tracking-wider text-white font-black leading-tight drop-shadow-lg">
                Electricity
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

export default Hero;
