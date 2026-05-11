import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Train, Bus, Hotel, Film, Sparkles, Zap, Music, Mic, Trophy } from 'lucide-react';

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const sequence = [
      { duration: 2000, next: 1 }, // Space Zoom
      { duration: 1500, next: 2 }, // Globe Data Streams
      { duration: 1500, next: 3 }, // Travel Journey
      { duration: 1500, next: 4 }, // Event Explosion (Music, Mic, Trophy)
      { duration: 1500, next: 5 }, // Final Logo/Pro Branding
    ];

    let timer: NodeJS.Timeout;
    const runSequence = (index: number) => {
      if (index >= sequence.length) {
        onComplete();
        return;
      }
      setPhase(index);
      timer = setTimeout(() => runSequence(index + 1), sequence[index].duration);
    };

    runSequence(0);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
      className="fixed inset-0 z-[200] bg-black overflow-hidden flex items-center justify-center text-white"
    >
      {/* Dynamic Background */}
      <motion.div 
        animate={{ 
          scale: phase === 0 ? [1, 2] : 1.2,
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-primary/20 rounded-full blur-[150px]"
      />

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="phase0"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl absolute" />
            <div className="relative text-primary font-mono text-[8px] tracking-[0.8em] uppercase mb-6 animate-pulse">
              Initializing Experience
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary blur-2xl opacity-20" />
              <Film size={80} className="text-white relative z-10" />
            </div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/20 h-[1px]"
                initial={{ width: 0, x: -1000 }}
                animate={{ width: "100%", x: 1000 }}
                transition={{ duration: 0.8, delay: i * 0.05, repeat: Infinity }}
                style={{ top: `${(i / 20) * 100}%` }}
              />
            ))}
            <div className="relative z-10 text-center">
               <div className="text-[10px] font-black uppercase tracking-[0.6em] text-primary mb-3">Syncing World Map</div>
               <div className="text-5xl md:text-7xl font-black italic tracking-tighter mix-blend-difference">GLOBAL NETWORKS</div>
            </div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="phase2"
            className="flex gap-16 items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ scale: 2, opacity: 0, filter: 'blur(20px)' }}
          >
            {[
              { icon: Plane, label: 'FLIGHT', delay: 0 },
              { icon: Train, label: 'TRAIN', delay: 0.2 },
              { icon: Bus, label: 'BUS', delay: 0.4 }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: item.delay }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                  <item.icon size={48} className={idx % 2 === 0 ? "text-primary" : "text-white"} />
                </div>
                <div className="text-[8px] font-black tracking-[0.4em] uppercase text-gray-500">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0, filter: 'blur(30px)' }}
            className="flex gap-12 items-center"
          >
            {[
              { icon: Music, color: 'text-primary' },
              { icon: Mic, color: 'text-white' },
              { icon: Trophy, color: 'text-primary/60' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, delay: idx * 0.2, repeat: Infinity }}
              >
                <div className="p-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl">
                  <item.icon size={64} className={item.color} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div
            key="phase4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-[600px] h-[600px] border border-dashed border-primary/20 rounded-full"
            />
            <div className="flex items-center justify-center gap-3 mb-6">
               <Zap size={20} className="text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-500">Exhibition Engine v4.0</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-white italic relative">
               TICKET<span className="text-primary">X</span>
               <motion.span 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.5, duration: 0.8 }}
                 className="absolute -right-16 -top-2 text-2xl font-black not-italic bg-primary text-black px-3 py-1 rounded"
               >
                 PRO
               </motion.span>
            </h1>
            <div className="w-80 h-1 bg-gray-900 rounded-full overflow-hidden mt-12">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-primary shadow-[0_0_30px_rgba(255,107,0,0.8)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Production Metadata Footer */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end opacity-20 pointer-events-none">
        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed font-mono">
           TX-PRO-CORE // {new Date().getFullYear()} <br />
           CLUSTER: NARASARAOPET_REGIONAL_01
        </div>
        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right leading-relaxed font-mono">
           ENCRYPTION: AES_256_GCM <br />
           STATUS: SYSTEM_READY
        </div>
      </div>
    </motion.div>
  );
}

