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
      className="bg-white px-6 md:px-16 py-16 md:py-24 border-t border-black"
    >
      <div className="section-label" style={{ color: "#000000", borderColor: "#000000" }}>
        Simple Process
      </div>
      <h2 className="section-title !text-black !bg-none drop-shadow-none">HOW IT WORKS?</h2>
      <p className="text-neutral-600 max-w-md mb-16 uppercase tracking-wider font-bold">
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
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 rounded bg-black/5 flex items-center justify-center border border-black cursor-pointer"
            >
              <step.icon className="w-5 h-5 text-black" />
            </motion.div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-black">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-snug font-medium">
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
            className="snap-center shrink-0 w-[60vw] max-w-[200px] bg-black/5 border border-black rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 text-[100px] font-black text-black/5 leading-none select-none z-0">
              {i + 1}
            </div>
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center border border-black relative z-10"
            >
              <step.icon className="w-5 h-5 text-black" />
            </motion.div>
            <div className="relative z-10">
              <h3 className="font-bold text-[13px] uppercase tracking-wider mb-2 text-black">
                {step.title}
              </h3>
              <p className="text-[11px] text-neutral-600 leading-snug font-medium">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
