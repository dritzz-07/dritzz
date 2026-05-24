import { motion } from 'motion/react';
import { Home, Droplets, UserCheck, Clock, ShieldCheck, CreditCard } from 'lucide-react';

const reasons = [
  {
    icon: Home,
    title: 'Truly Doorstep',
    desc: 'We come to your home, office, or anywhere in Hyderabad. No travel needed on your part.'
  },
  {
    icon: Droplets,
    title: 'Eco-Friendly Methods',
    desc: 'We use minimal water and biodegradable cleaning agents — good for your car and the planet.'
  },
  {
    icon: UserCheck,
    title: 'Trained Professionals',
    desc: 'Our team is background-verified and trained to handle all car types with utmost care.'
  },
  {
    icon: Clock,
    title: 'On-Time Every Time',
    desc: 'We respect your schedule. Book a slot and we\'ll be there — no delays, no excuses.'
  },
  {
    icon: CreditCard,
    title: 'Secure Online Payment',
    desc: 'Pay instantly via UPI, card, or net banking through our secure payment partners.'
  },
  {
    icon: ShieldCheck,
    title: 'Damage Guarantee',
    desc: 'We treat your car like our own. Any accidental damage during service is fully covered.'
  }
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-black px-6 md:px-16 py-24 border-t border-white/5">
      <div className="section-label">Our Promise</div>
      <h2 className="section-title">WHY DRITZZ?</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-16">
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {reasons.map((reason, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/10">
                  <reason.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-white">{reason.title}</h3>
                  <p className="text-xs text-neutral-300 leading-snug">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative group h-[300px] md:h-[500px] w-full"
        >
          <img 
            src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop" 
            alt="Dritzz Service" 
            className="w-full h-full object-cover rounded-3xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent rounded-3xl" />
          <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/40  rounded-2xl border border-white/5">
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Premium Detailing</p>
            <p className="text-xs text-neutral-100 uppercase tracking-[0.2em]">Quality you can trust, delivered to your door.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
