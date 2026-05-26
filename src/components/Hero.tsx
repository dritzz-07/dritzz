import { motion } from "motion/react";
import { Star, Droplets, Zap } from "lucide-react";
import { useRef, useState } from "react";

import heroImage from "../assets/images/regenerated_image_1779233473318.png";

export default function Hero() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleCarClick = () => {
    if (isStarting) return;

    setIsStarting(true);
    if (!audioRef.current) {
      // We will look for a locally uploaded file named car-start.mp3 in the public folder
      audioRef.current = new Audio("/car-start.mp3");
      audioRef.current.load();
    }

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn(
          "Local audio not found, please upload car-start.mp3 to the public folder. Error:",
          e,
        );
        setIsStarting(false);
      });
    }

    setTimeout(() => {
      setIsStarting(false);
    }, 2000);
  };
  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center px-6 md:px-16 pt-[120px] md:pt-[200px] pb-10 md:pb-20 overflow-hidden bg-black">
      {/* Background Image of Wet Porsche */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent md:w-2/3 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-10" />
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1503376712394-6b22c7104b90?q=80&w=2500&auto=format&fit=crop"
          alt="Wet Black Porsche"
          className="w-full h-full object-cover object-[70%_center] md:object-right"
          referrerPolicy="no-referrer"
          fetchPriority="high"
        />
      </div>

      {/* Background Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated Bubbles/Droplets */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
              opacity: Math.random() * 0.3 + 0.1,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: "-10%",
              x: Math.random() * 100 - 50 + "%",
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute"
          >
            <Droplets className="text-white/20 w-4 h-4" />
          </motion.div>
        ))}

        {/* High Pressure Spray Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`spray-${i}`}
            initial={{ x: "-10%", y: 20 + i * 15 + "%", scaleX: 0, opacity: 0 }}
            animate={{
              x: ["0%", "100%"],
              scaleX: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute h-px w-64 bg-linear-to-r from-transparent via-white to-transparent"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 -mb-[35px]">
        <div className="max-w-3xl flex-1 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-3 py-1 mb-[18px] rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-neutral-100 h-[25.7639px]"
          >
            Now Serving Hyderabad
          </motion.div>

          <motion.h1 className="font-sporty font-black text-[28px] md:text-[46px] leading-[1.1] md:leading-[1.1] tracking-tighter mb-8 md:mb-10 uppercase select-none flex flex-wrap gap-x-3 md:gap-x-5 gap-y-1 md:gap-y-2">
            {["India’s Smartest", "Doorstep Car", "Wash Service"]
              .join(" ")
              .split(" ")
              .map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: [0, -15, 0], // Floating animation
                    scale: 1,
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.2 + i * 0.1 },
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5 + i * 0.2,
                    },
                    scale: { duration: 0.8, delay: 0.2 + i * 0.1 },
                  }}
                  className="inline-block bg-linear-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent drop-shadow-sm"
                >
                  {word}
                </motion.span>
              ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-sm md:text-xs text-neutral-100 leading-relaxed max-w-2xl mb-12 uppercase font-display tracking-[0.2em] font-medium"
          >
            PROFESSIONAL CLEANING AT YOUR HOME, OFFICE, OR APARTMENT — FAST,
            AFFORDABLE, AND HASSLE-FREE.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-x-8 sm:gap-y-4 md:mb-12 mb-8"
          >
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] w-full sm:w-auto">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 rounded-full bg-zinc-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                style={{ backgroundColor: "#66a7e9", borderColor: "#0a0808" }}
              >
                <Droplets
                  className="w-6 h-6 text-white"
                  style={{ backgroundColor: "#66a7e9" }}
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-300 font-bold border-none text-shadow-none">
                  WE USE OUR OWN
                </span>
                <span className="text-xs uppercase tracking-widest text-white font-black border-none text-shadow-none">
                  WATER SOURCE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] w-full sm:w-auto">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
              >
                <Zap className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-yellow-300 font-bold border-none text-shadow-none">
                  WE USE OUR OWN
                </span>
                <span className="text-xs uppercase tracking-widest text-white font-black border-none text-shadow-none">
                  ELECTRICITY
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4 md:mb-20 mb-8"
          >
            <a href="#booking" className="btn-primary decoration-none">
              Book Now
            </a>
            <a
              href="#packages"
              className="btn-secondary decoration-none hover:!text-white"
            >
              View Pricing
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap gap-12 pt-8 border-t border-white/5"
          >
            {[
              { label: "Happy Cars", value: "250+" },
              { label: "Avg Rating", value: "4.9", icon: true },
              { label: "Avg Service Time", value: "30 Min" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="font-display text-4xl text-white flex items-center gap-1">
                  {stat.value}
                  {stat.icon && <Star className="w-6 h-6 fill-white" />}
                </div>
                <div className="text-xs uppercase tracking-widest text-neutral-300 font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex-1 w-full max-w-2xl relative z-20 mt-12 lg:mt-0"
        >
          <div className="absolute hidden md:block inset-0 bg-white/5 rounded-3xl opacity-10 transform scale-105" />
          <img
            src={heroImage}
            alt="Dritzz Doorstep Car Wash"
            className="w-full h-auto shadow-2xl relative z-10 object-cover aspect-[4/3] bg-black"
            style={{
              borderStyle: "none",
              borderRadius: "10px",
              backgroundColor: "#000000",
            }}
            fetchPriority="high"
          />
        </motion.div>
      </div>
    </section>
  );
}
