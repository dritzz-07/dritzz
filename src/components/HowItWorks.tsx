import { useRef } from "react";
import { motion } from "motion/react";
import { Calendar, CreditCard, Car, Sparkles } from "lucide-react";
import { useAutoScroll } from "../hooks/useAutoScroll";

const steps = [
  {
    icon: Calendar,
    title: "Book Online",
    desc: "Choose your package, pick a date and time that suits you, and fill in your details.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    desc: "Complete your payment instantly via UPI, card, or net banking.",
  },
  {
    icon: Car,
    title: "We Arrive",
    desc: "Our trained team arrives at your doorstep at your scheduled time with all equipment.",
  },
  {
    icon: Sparkles,
    title: "Drive Spotless",
    desc: "Enjoy your freshly detailed car. We clean up everything before we leave.",
  },
];

export default function HowItWorks() {
  const scrollRef = useRef<HTMLDivElement>(null);
  useAutoScroll(scrollRef, 2000);

  return (
    <section
      id="how-it-works"
      className="bg-black px-6 md:px-16 py-16 md:py-24 border-t border-white/10"
    >
      <div className="section-label !bg-white/10 !border-white/20 !text-white">
        Simple Process
      </div>
      <h2 className="section-title !text-white !bg-none drop-shadow-none">HOW IT WORKS?</h2>
      <p className="text-neutral-400 max-w-md mb-16 uppercase tracking-wider font-bold">
        FOUR EASY STEPS TO A SPOTLESS CAR — WITHOUT LEAVING YOUR HOME.
      </p>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col gap-4"
          >
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ animate: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }, hover: { type: "spring", stiffness: 300 } }}
              className="w-12 h-12 rounded bg-white/5 flex items-center justify-center border border-white/20 cursor-pointer"
            >
              <step.icon className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-snug font-medium">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Swipe View */}
      <div 
        ref={scrollRef}
        className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 hide-scrollbar relative"
      >
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="snap-center shrink-0 w-[60vw] max-w-[200px] bg-white/5 border border-white/20 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 text-[100px] font-black text-white/5 leading-none select-none z-0">
              {i + 1}
            </div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 relative z-10"
            >
              <step.icon className="w-5 h-5 text-white" />
            </motion.div>
            <div className="relative z-10">
              <h3 className="font-bold text-[13px] uppercase tracking-wider mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-[11px] text-neutral-400 leading-snug font-medium">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
