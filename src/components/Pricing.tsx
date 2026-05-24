import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sparkles, Gem, Check, CalendarRange, ArrowRight } from 'lucide-react';
import { PACKAGES } from '../constants';
import { VehicleType, Package } from '../types';

const IconMap: Record<string, any> = {
  Droplets,
  Sparkles,
  Gem
};

interface PricingProps {
  onSelectPackage: (pkgId: string, vehicleType: VehicleType) => void;
}

export default function Pricing({ onSelectPackage }: PricingProps) {
  const [vehicle, setVehicle] = useState<VehicleType>('hatchback');

  const getButtonText = (pkgId: string) => {
    switch (pkgId) {
      case 'monthly':
        return 'Get Membership';
      case 'premium':
        return 'Book Premium Wash';
      case 'basic':
      default:
        return 'Book Now';
    }
  };

  const getBadgeText = (pkgId: string) => {
    if (pkgId === 'monthly') return 'MOST POPULAR 💎';
    if (pkgId === 'premium') return 'Best Seller';
    return null;
  };

  // Reorder packages so Monthly is in the center on large screens
  const orderedPackages = [
    PACKAGES.find(p => p.id === 'basic'),
    PACKAGES.find(p => p.id === 'monthly'),
    PACKAGES.find(p => p.id === 'premium'),
  ].filter(Boolean) as Package[];

  return (
    <section id="packages" className="px-6 md:px-16 py-32 bg-[#0a0a0a] border-t border-white/5 relative overflow-hidden">
      {/* Premium Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center relative z-10 flex flex-col items-center mb-20">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-bold">Premium Doorstep Care</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-5 text-white tracking-tight leading-tight">
          Why Pay Every Time? <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 drop-shadow-sm">
            Go Monthly & Save More.
          </span>
        </h2>
        <p className="text-neutral-400 max-w-2xl text-base md:text-lg font-medium drop-shadow-sm">
          Professional doorstep car care designed for busy lifestyles.
        </p>
        
        {/* Vehicle Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12 bg-neutral-900/60 p-2 inset-shadow-sm rounded-full border border-white/10 backdrop-blur-md">
          {(['hatchback', 'sedan', 'suv'] as VehicleType[]).map((v) => (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`px-8 py-3.5 text-xs uppercase tracking-[0.15em] font-bold transition-all duration-300 rounded-full ${
                vehicle === v 
                  ? 'bg-blue-600 text-white shadow-[0_4px_25px_rgba(37,99,235,0.5)]' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {v === 'hatchback' && <HatchbackIcon className="w-4 h-4" />}
                {v === 'sedan' && <SedanIcon className="w-4 h-4" />}
                {v === 'suv' && <SuvIcon className="w-4 h-4" />}
                <span>{v === 'suv' ? 'SUV / MUV' : v}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="popLayout">
          {orderedPackages.map((pkg) => {
            const Icon = IconMap[pkg.icon] || Droplets;
            const price = pkg.price[vehicle];
            const isMonthly = pkg.id === 'monthly';
            const badgeText = getBadgeText(pkg.id);
            
            return (
              <motion.div
                layout
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -16,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className={`group relative flex flex-col w-full max-w-md lg:w-1/3 transition-all duration-500 rounded-[2rem] 
                  ${isMonthly 
                    ? 'p-10 lg:-mt-8 lg:mb-8 bg-gradient-to-b from-blue-900/40 to-neutral-900/80 border-2 border-blue-500/50 shadow-[0_0_60px_-15px_rgba(37,99,235,0.5)] z-20 scale-100 lg:scale-105' 
                    : 'p-8 lg:mt-8 bg-neutral-900/30 backdrop-blur-xl border border-white/10 shadow-xl hover:border-white/20 z-10'
                  }`}
              >
                {/* Glowing Border effect for Monthly */}
                {isMonthly && (
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-blue-400/[0.15] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}

                {/* Badges */}
                {badgeText && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-xl
                    ${isMonthly ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/40 border border-blue-400/50' : 'bg-neutral-800 text-neutral-200 border border-white/10'}`}>
                    {badgeText}
                  </div>
                )}
                
                {isMonthly && (
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute top-8 right-8"
                  >
                    <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-20 rounded-full" />
                    <Icon className="w-10 h-10 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(60,130,246,0.6)]" />
                  </motion.div>
                )}
                {!isMonthly && (
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-6 h-6 text-neutral-300" />
                  </div>
                )}
                
                <h3 className={`font-black tracking-tight mb-2 uppercase ${isMonthly ? 'text-2xl text-white' : 'text-2xl text-neutral-100'}`}>
                  {pkg.name}
                </h3>
                <p className={`text-sm mb-8 leading-relaxed font-medium ${isMonthly ? 'text-blue-200/80' : 'text-neutral-400'}`}>
                  {pkg.tagline}
                </p>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-black tracking-tighter ${isMonthly ? 'text-6xl text-white' : 'text-5xl text-neutral-100'}`}>
                      ₹{price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`text-[11px] uppercase tracking-widest font-bold ${isMonthly ? 'text-blue-300' : 'text-neutral-500'}`}>
                       {isMonthly ? 'per month' : 'per wash'} · {vehicle === 'suv' ? 'SUV / MUV' : vehicle}
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-8" />

                <ul className="flex-1 space-y-4 mb-10">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-4 text-sm font-medium ${isMonthly && idx === 0 ? 'text-white' : 'text-neutral-300'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isMonthly && idx === 0 ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={isMonthly && idx === 0 ? 'font-bold' : ''}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isMonthly && (
                  <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-sm font-bold text-blue-200">Save Up To ₹1,500+ Monthly</span>
                  </div>
                )}

                <button
                  onClick={() => onSelectPackage(pkg.id, vehicle)}
                  className={`w-full py-4 rounded-xl text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-md relative overflow-hidden group/btn ${
                    isMonthly 
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  {isMonthly && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {getButtonText(pkg.id)}
                    {isMonthly && <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-40 max-w-5xl mx-auto px-4 md:px-0 relative z-10 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative px-8 py-16 md:p-24 rounded-[3rem] bg-[#050505] border border-white/10 overflow-hidden group shadow-[0_0_80px_-20px_rgba(37,99,235,0.3)] text-center"
        >
          {/* Animated Background Gradients & Glows */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full group-hover:bg-blue-500/30 transition-colors duration-1000 pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full group-hover:bg-blue-800/30 transition-colors duration-1000 pointer-events-none" />

          {/* Premium Grid/Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* Top Edge Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70" />

          <div className="relative z-10 flex flex-col items-center">
            {/* VIP Badge */}
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-blue-300">Dritzz Black Membership</span>
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>

            <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              <span className="text-white drop-shadow-md">One Membership.</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-blue-400 drop-shadow-[0_0_30px_rgba(147,197,253,0.3)]">Clean Car All Month.</span>
            </h3>
            <p className="text-neutral-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of smart car owners choosing an effortless, premium doorstep car care experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <button 
                onClick={() => onSelectPackage('monthly', vehicle)}
                className="w-full sm:w-auto px-10 py-[1.15rem] rounded-full bg-white text-black font-black uppercase tracking-[0.15em] text-sm shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Gem className="w-4 h-4" />
                Get Membership
              </button>
              <button 
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-[1.15rem] rounded-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.15em] text-sm hover:bg-white/10 transition-all duration-300 backdrop-blur-md flex items-center justify-center"
              >
                Schedule Wash
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const SedanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.36,10.59l-3.33-4.44A3,3,0,0,0,15.63,5H8.38a3,3,0,0,0-2.4,1.15L2.64,10.59A3,3,0,0,0,2,12.4V17a2,2,0,0,0,2,2h1a2,2,0,0,0,2-2v-1h10v1a2,2,0,0,0,2,2h1a2,2,0,0,0,2-2V12.4A3,3,0,0,0,21.36,10.59ZM7.58,7.35a1,1,0,0,1,.8-.35h7.24a1,1,0,0,1,.8.4l2.1,2.8a1,1,0,0,1-.8,1.6H5.48a1,1,0,0,1-.8-1.6ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
)

const HatchbackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.45,10.63l-2-4A1.986,1.986,0,0,0,15.66,5.5h-8.5A2,2,0,0,0,5.4,6.63l-1.92,4.8A2.99,2.99,0,0,0,2,14.07V18a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-1h14v1a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-3.93A2.99,2.99,0,0,0,19.45,10.63ZM7.33,7.5h8.5l1.09,2.18A1.018,1.018,0,0,0,17.83,10H5.53A1,1,0,0,0,6.46,9.68ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
)

const SuvIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.45,10.63l-2-6A1.986,1.986,0,0,0,15.66,3.5h-8.5A2,2,0,0,0,5.4,4.63l-2,6A2.99,2.99,0,0,0,2,13v5a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-1h14v1a1,1,0,0,0,1,1h1a1,1,0,0,0,1-1v-5A2.99,2.99,0,0,0,19.45,10.63ZM7.33,5.5h8.5l1.67,5H6.5ZM6.5,15.5A1.5,1.5,0,1,1,8,14,1.5,1.5,0,0,1,6.5,15.5Zm11,0A1.5,1.5,0,1,1,19,14,1.5,1.5,0,0,1,17.5,15.5Z" />
  </svg>
)