import { motion } from 'motion/react';

const images = [
  {
    src: "https://images.unsplash.com/photo-1633867179970-c54688bcfa33?q=80&w=2000&auto=format&fit=crop",
    alt: "Premium SUV Wash",
    className: "col-span-1 md:col-span-2 row-span-2"
  },
  {
    src: "https://images.unsplash.com/photo-1683647115932-b33455fe6a3e?q=80&w=1000&auto=format&fit=crop",
    alt: "Hatchback Care",
    className: "col-span-1 row-span-1"
  },
  {
    src: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop",
    alt: "Sedan Care",
    className: "col-span-1 row-span-1"
  },
  {
    src: "https://images.unsplash.com/photo-1608506375591-b90e1f955e4b?q=80&w=2000&auto=format&fit=crop",
    alt: "Pressure Foam Wash",
    className: "col-span-1 md:col-span-2 row-span-1"
  }
];

export default function PremiumGallery() {
  return (
    <section className="bg-black px-6 md:px-16 py-24 border-t border-white/5">
      <div className="section-label">The Dritzz Experience</div>
      <h2 className="section-title text-white">PREMIUM CARE</h2>
      <p className="text-neutral-400 max-w-md mb-16 uppercase tracking-wider">
        World-class detailing for machines that demand respect.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, filter: 'grayscale(100%)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'grayscale(0%)' }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.15,
              ease: [0.25, 0.1, 0.25, 1] // cubic-bezier smooth out
            }}
            whileHover={{ y: -5 }}
            className={`relative group overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-white/30 transition-all duration-500 ${img.className}`}
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0 -translate-x-[150%] bg-linear-to-tr from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
            </div>

            <motion.img 
              src={img.src} 
              alt={img.alt} 
              animate={{
                scale: [1.1, 1.15, 1.1],
                x: ["0%", "-2%", "0%"],
                y: ["0%", "1%", "0%"]
              }}
              transition={{
                duration: 25 + i * 5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.2] origin-center"
            />
            <div className="absolute inset-0 z-10 bg-linear-to-t from-black/90 via-black/10 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />
            <div className="absolute bottom-6 left-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="h-0.5 w-0 bg-white mb-2 group-hover:w-8 transition-all duration-500 ease-out" />
              <span className="text-white text-sm font-black uppercase tracking-[0.3em] font-mono drop-shadow-md">{img.alt}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
