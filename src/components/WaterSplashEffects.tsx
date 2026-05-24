import { motion, useScroll, useTransform } from 'motion/react';
import { Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WaterSplashEffects() {
  const { scrollYProgress } = useScroll();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate static particle positions for consistent hydration
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 1000, // Spread across a very large vertical area
      size: Math.random() * 6 + 2,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);
  }, []);

  // Control opacity and movement based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.2, 0.2, 0]);
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -500]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Background Droplets */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y % 100}%`,
            opacity,
            y: yOffset,
            filter: p.id % 3 === 0 ? 'blur(1px)' : 'none',
            scale: p.id % 3 === 0 ? 1.2 : 1
          }}
          className="absolute"
        >
          <motion.div
            animate={{ 
              y: [0, -40, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          >
            <Droplets 
              size={p.size + 4} 
              className="text-zinc-300 fill-zinc-400/30" 
              strokeWidth={1} 
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Surface Ripples */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ripple-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ 
            opacity: [0, 0.4, 0],
            scale: [0.2, 1.5],
            borderWidth: ["4px", "1px"]
          }}
          viewport={{ margin: "-100px" }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatDelay: Math.random() * 5
          }}
          className="absolute border-2 border-zinc-400/20 rounded-full"
          style={{
            top: `${10 + i * 12}%`,
            left: `${Math.random() * 80 + 10}%`,
            width: '300px',
            height: '150px',
            transform: 'rotateX(70deg)'
          }}
        />
      ))}

      {/* Subtle Mist/Vapor Layers */}
      <motion.div 
        style={{ opacity: useTransform(scrollYProgress, [0, 1], [0.1, 0.25]) }}
        className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-500/5 to-transparent mix-blend-screen"
      />
    </div>
  );
}
