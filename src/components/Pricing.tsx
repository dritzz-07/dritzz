import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sparkles, Gem, Check } from 'lucide-react';
import { PACKAGES } from '../constants';
import { VehicleType } from '../types';

const IconMap: Record<string, any> = {
  Droplets,
  Sparkles,
  Gem
};

interface PricingProps {
  onSelectPackage: (pkgId: string, vehicleType: VehicleType) => void;
  isDiscountApplied?: boolean;
  onOpenDiscount?: () => void;
}

export default function Pricing({ onSelectPackage, isDiscountApplied, onOpenDiscount }: PricingProps) {
  const [vehicle, setVehicle] = useState<VehicleType>('hatchback');

  return (
    <section id="packages" className="px-6 md:px-16 py-24 bg-black border-t border-white/5">
      <div className="section-label">Our Pricing</div>
      <h2 className="section-title text-white">CHOOSE YOUR PACKAGE</h2>
      <p className="text-neutral-400 max-w-md mb-12">Select your vehicle type and the package that suits you.</p>

      <div className="flex flex-wrap gap-3 mb-12">
        {(['hatchback', 'sedan', 'suv'] as VehicleType[]).map((v) => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={v}
            onClick={() => setVehicle(v)}
            className={`px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 rounded-full border ${
              vehicle === v ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-neutral-400 border-white/10 hover:border-white/40 hover:text-white'
            }`}
          >
            {v === 'suv' ? 'SUV / MUV' : v}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {PACKAGES.map((pkg) => {
            const Icon = IconMap[pkg.icon] || Droplets;
            const originalPrice = pkg.price[vehicle];
            const price = Math.round(originalPrice * 0.75);
            
            return (
              <motion.div
                layout
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className={`group relative flex flex-col p-10 bg-neutral-900/50 backdrop-blur-xl border rounded-2xl transition-all duration-500 ${
                  pkg.featured 
                    ? 'border-white ring-1 ring-white shadow-[0_0_80px_-20px_rgba(255,255,255,0.3)] z-10' 
                    : 'border-white/5 shadow-sm hover:border-white/40 hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.1)]'
                }`}
              >
                {/* 25% OFF Badge in heading */}
                <div className="absolute top-6 right-6">
                  <div className="px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse">
                    25% OFF
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-linear-to-b from-white/[0.05] to-transparent pointer-events-none" />

                {pkg.featured && (
                  <div className="absolute -top-3 left-10 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full z-20">
                    Most Popular
                  </div>
                )}
                
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 transition-colors group-hover:bg-white/10">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-white uppercase">{pkg.name}</h3>
                <p className="text-sm text-neutral-400 mb-8 leading-relaxed">{pkg.tagline}</p>
                
                <div className="mb-0">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">
                    Special Intro Price
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white tracking-tighter">₹{price}</span>
                    <span className="text-xl text-neutral-500 line-through decoration-white/20 tracking-tighter">₹{originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      per wash · {vehicle === 'suv' ? 'SUV / MUV' : vehicle}
                    </div>
                  </div>
                </div>

                <ul className="flex-1 space-y-4 mb-10">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-neutral-400 leading-tight">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPackage(pkg.id, vehicle)}
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    pkg.featured 
                      ? 'bg-white text-black hover:bg-neutral-200' 
                      : 'bg-transparent text-white border border-white/20 hover:border-white'
                  }`}
                >
                  {pkg.featured ? 'Get Started' : 'Select Package'}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
