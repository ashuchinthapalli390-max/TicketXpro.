import React from 'react';
import { motion } from 'motion/react';
import { Plane, Search, Calendar, MapPin, Film, Hotel, Ticket, Train, Bus, ChevronRight, Zap, Target } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { BookingCategory } from '../types';
import { cn } from '../lib/utils';

interface HeroProps {
  onSearch: (category: string, query: string) => void;
}

const ICON_MAP: Record<string, any> = { 
  Bus, 
  Train, 
  Plane, 
  Film, 
  Hotel, 
  MapPin, 
  Ticket, 
  Zap, 
  Target 
};

export default function Hero({ onSearch }: HeroProps) {
  const [category, setCategory] = React.useState<string>('Transportation');
  const [query, setQuery] = React.useState('');

  return (
    <section className="relative px-6 md:px-10 pt-32 pb-12 lg:pb-20 overflow-hidden">
      {/* Aesthetic Background Text */}
      <div className="absolute top-24 right-10 text-cinematic-xl font-black text-secondary/5 leading-none pointer-events-none select-none tracking-tighter hidden lg:block uppercase font-accent">
        UNIFIED
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 lg:mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-12 bg-primary" />
            <span className="text-primary text-xs font-black uppercase tracking-[0.6em]">System Protocol 4.2</span>
          </div>
          <h1 className="text-6xl md:text-8xl leading-[0.85] font-display font-black uppercase tracking-tight mb-8">
            Global <span className="text-stroke">Node</span> <br/>
            Allocation.
          </h1>
          <p className="text-lg md:text-xl text-secondary/60 max-w-xl font-medium leading-relaxed font-mono uppercase tracking-widest text-sm">
            Autonomous inventory synchronization for elite transport, entertainment, and sector-locked venues.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl"
        >
          {/* Universal Search Bar - Adaptive */}
          <div className="bg-black/40 backdrop-blur-3xl border border-teal-900/30 rounded-sm p-1 flex flex-col lg:flex-row items-stretch lg:items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-teal-900/20">
              <div className="px-8 py-6">
                <label className="block text-[9px] uppercase tracking-[0.4em] text-primary font-black mb-3">Universal Registry</label>
                <div className="flex items-center gap-3">
                  <Search size={18} className="text-primary/50 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-white placeholder-white/10 text-lg font-black uppercase tracking-widest"
                  />
                </div>
              </div>
              
              <div className="px-8 py-6">
                <label className="block text-[9px] uppercase tracking-[0.4em] text-secondary/40 font-black mb-3">Protocol</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-white text-lg font-black uppercase tracking-widest appearance-none cursor-pointer pr-8"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.label} className="bg-dark">{cat.label.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-secondary/30" />
                </div>
              </div>

              <div className="px-8 py-6">
                <label className="block text-[9px] uppercase tracking-[0.4em] text-secondary/40 font-black mb-3">Chronos Sync</label>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-secondary/30 shrink-0" />
                  <input
                    type="text"
                    disabled
                    placeholder="AUTO_DETECT"
                    className="bg-transparent border-none outline-none w-full text-white placeholder-white/20 text-lg font-black uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="px-8 py-6">
                <label className="block text-[9px] uppercase tracking-[0.4em] text-secondary/40 font-black mb-3">Node Count</label>
                <div className="flex items-center gap-3">
                   <Target size={18} className="text-secondary/30 shrink-0" />
                   <input
                    type="text"
                    placeholder="ALLOCATE"
                    className="bg-transparent border-none outline-none w-full text-white placeholder-white/20 text-lg font-black uppercase tracking-widest"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onSearch(category, query)}
              className="bg-primary text-black lg:h-full lg:px-12 py-8 lg:py-0 text-lg font-black uppercase tracking-[0.4em] hover:bg-orange-400 transition-all active:scale-95 shadow-[0_0_30px_rgba(242,125,38,0.3)]"
            >
              Initialize Search
            </button>
          </div>

          {/* Quick Category Grid */}
          <div className="mt-16 flex lg:grid lg:grid-cols-5 gap-6 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Ticket;
              const isActive = category === cat.label;
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => {
                    setCategory(cat.label);
                    onSearch(cat.label, query);
                  }}
                  className={cn(
                    "relative group shrink-0 w-44 lg:w-full border p-8 transition-all duration-500 cursor-pointer overflow-hidden",
                    isActive 
                      ? "bg-primary/5 border-primary shadow-[0_0_30px_rgba(242,125,38,0.1)]" 
                      : "bg-black/20 border-teal-900/20 grayscale hover:grayscale-0 hover:border-primary/40"
                  )}
                >
                  <div className={cn("absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 transition-all duration-500", isActive ? "border-primary" : "border-transparent group-hover:border-primary/30")} />
                  
                  <div className={cn("mb-6 transition-transform duration-500 group-hover:scale-110", isActive ? "text-primary" : "text-primary/40")}>
                    <Icon size={32} />
                  </div>
                  <h3 className="font-black uppercase tracking-tighter text-xl mb-1">{cat.label}</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-secondary/30 font-black">Unified Node</p>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(242,125,38,0.5)]"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
