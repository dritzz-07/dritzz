import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sparkles, Gem, Check, Car, Building2, CalendarRange } from 'lucide-react';
import { PACKAGES } from '../constants';
import { VehicleType } from '../types';

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
      case 'premium':
        return 'Get Membership';
      case 'mid':
        return 'Book Now';
      default:
        return 'Schedule Wash';
    }
  };

  return (
    <section id="packages" className="px-6 md:px-16 py-24 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Launch Offer Banner */}
      <div className="flex justify-center mb-12">
         <div className="px-6 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            First Wash Starting At Just ₹299
         </div>
      </div>

      <div className="text-center relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Affordable Premium Car Care</h2>
        <p className="text-neutral-400 max-w-2xl mb-12 text-lg">Professional doorstep car wash services designed for busy lifestyles in Hyderabad.</p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16 bg-neutral-900/50 p-2 rounded-full border border-white/10 backdrop-blur-sm">
          {(['hatchback', 'sedan', 'suv'] as VehicleType[]).map((v) => (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-300 rounded-full ${
                vehicle === v ? 'bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                {v === 'suv' ? 'SUV / MUV' : v}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="popLayout">
          {PACKAGES.map((pkg) => {
            const Icon = IconMap[pkg.icon] || Droplets;
            const price = pkg.price[vehicle];
            
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
                className={`group relative flex flex-col p-10 bg-neutral-900/40 backdrop-blur-xl rounded-3xl transition-all duration-500 overflow-hidden ${
                  pkg.featured 
                    ? 'border-blue-500 ring-1 ring-blue-500 shadow-[0_0_50px_-15px_rgba(37,99,235,0.4)] z-10' 
                    : 'border-white/10 shadow-lg border hover:border-blue-500/50 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)]'
                }`}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-b from-blue-600/[0.08] to-transparent pointer-events-none" />

                {pkg.featured && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-80" />
                )}
                
                {pkg.featured && (
                  <div className="absolute top-6 right-6">
                    <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-8 transition-colors group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 text-neutral-300">
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-black tracking-tight mb-2 text-white uppercase">{pkg.name}</h3>
                <p className="text-sm text-neutral-400 mb-8 leading-relaxed font-medium">{pkg.tagline}</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">₹{price}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold">
                       {pkg.id === 'premium' ? 'per month' : 'per wash'} · {vehicle === 'suv' ? 'SUV / MUV' : vehicle}
                    </div>
                  </div>
                </div>

                <ul className="flex-1 space-y-4 mb-10">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-sm text-neutral-300 font-medium">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-blue-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPackage(pkg.id, vehicle)}
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-md ${
                    pkg.featured 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  {getButtonText(pkg.id)}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Promotional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-20 relative z-10">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-6"
         >
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
               <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
               <div className="text-xs uppercase tracking-widest font-black text-blue-400 mb-2">Society Offer</div>
               <h4 className="text-xl font-bold text-white leading-tight">Book 3 Cars Together &<br/>Get Flat 20% OFF</h4>
            </div>
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-6"
         >
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
               <CalendarRange className="w-8 h-8 text-purple-400" />
            </div>
            <div>
               <div className="text-xs uppercase tracking-widest font-black text-purple-400 mb-2">Subscription Offer</div>
               <h4 className="text-xl font-bold text-white leading-tight">Monthly Members Save<br/>Up To ₹1,200</h4>
            </div>
         </motion.div>
      </div>
    </section>
  );
}
