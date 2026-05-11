import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Armchair, MapPin, ChevronDown, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';

interface BusLayoutProps {
  node: BookingNode;
  onSeatSelect: (seats: string[]) => void;
}

export default function BusLayout({ node, onSeatSelect }: BusLayoutProps) {
  const [deck, setDeck] = useState<'lower' | 'upper'>('lower');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');

  const toggleSeat = (id: string) => {
    const next = selectedSeats.includes(id) 
      ? selectedSeats.filter(s => s !== id) 
      : [...selectedSeats, id];
    setSelectedSeats(next);
    onSeatSelect(next);
  };

  const renderDeck = (type: 'lower' | 'upper') => {
    const prefix = type === 'lower' ? 'L' : 'U';
    return (
      <div className="grid grid-cols-3 gap-6 bg-dark/40 p-8 rounded-2xl border border-teal-900/10 relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-secondary/20 tracking-[0.5em]">Bus Front</div>
        {/* Left column (2 seats) */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={`${prefix}-L-${r}`} className="flex gap-2">
              {Array.from({ length: 2 }).map((_, c) => {
                const id = `${prefix}${r * 2 + c + 1}`;
                const isSelected = selectedSeats.includes(id);
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSeat(id)}
                    className={cn(
                      "w-10 h-10 rounded-sm border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary text-black shadow-lg" : "bg-black/60 border-teal-900/20 text-secondary/40 hover:border-primary/40"
                    )}
                  >
                    <Armchair size={16} />
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
        {/* Aisle */}
        <div className="w-1 border-x border-teal-900/10 opacity-20" />
        {/* Right column (1 seat / berth) */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, r) => {
            const id = `${prefix}R${r + 1}`;
            const isSelected = selectedSeats.includes(id);
            return (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSeat(id)}
                className={cn(
                  "w-20 h-10 rounded-sm border flex items-center justify-center transition-all",
                  isSelected ? "bg-primary border-primary text-black shadow-lg" : "bg-black/60 border-teal-900/20 text-secondary/40 hover:border-primary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <Armchair size={16} />
                  <span className="text-[10px] font-mono">Sleeper</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Route Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black uppercase text-secondary/40 tracking-widest ml-1">Boarding Terminal</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
            <select 
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              className="w-full bg-black/60 border border-teal-900/20 rounded-sm py-4 pl-12 pr-10 outline-none focus:border-primary transition-all text-[11px] font-black uppercase appearance-none cursor-pointer"
            >
              <option value="" className="bg-dark">SELECT BOARDING POINT</option>
              <option value="main-hub" className="bg-dark">MAIN CITY HUB (09:00 PM)</option>
              <option value="north-gate" className="bg-dark">NORTH GATE STATION (09:45 PM)</option>
              <option value="outer-ring" className="bg-dark">OUTER RING BYPASS (10:30 PM)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none" size={14} />
          </div>
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black uppercase text-secondary/40 tracking-widest ml-1">Arrival Terminal</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size={14} />
            <select 
              value={droppingPoint}
              onChange={(e) => setDroppingPoint(e.target.value)}
              className="w-full bg-black/60 border border-teal-900/20 rounded-sm py-4 pl-12 pr-10 outline-none focus:border-primary transition-all text-[11px] font-black uppercase appearance-none cursor-pointer"
            >
              <option value="" className="bg-dark">SELECT ARRIVAL POINT</option>
              <option value="central-square" className="bg-dark">CENTRAL SQUARE HUB (05:00 AM)</option>
              <option value="east-terminal" className="bg-dark">EAST TERMINAL (05:45 AM)</option>
              <option value="beach-crossing" className="bg-dark">BEACH SIDE CROSSING (06:30 AM)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Deck Selector */}
      <div className="flex justify-center bg-black/60 p-1 rounded-full border border-teal-900/20 w-fit mx-auto">
        <button 
          onClick={() => setDeck('lower')}
          className={cn(
            "px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
            deck === 'lower' ? "bg-primary text-black" : "text-secondary/40 hover:text-white"
          )}
        >
          Lower Deck
        </button>
        <button 
          onClick={() => setDeck('upper')}
          className={cn(
            "px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
            deck === 'upper' ? "bg-primary text-black" : "text-secondary/40 hover:text-white"
          )}
        >
          Upper Deck
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={deck}
          initial={{ opacity: 0, x: deck === 'lower' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: deck === 'lower' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto"
        >
          {renderDeck(deck)}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3 justify-center p-4 bg-teal-400/5 border border-teal-400/20 rounded-xl mt-4">
        <Info size={16} className="text-teal-400" />
        <div className="text-left">
           <p className="text-[10px] font-black uppercase tracking-widest text-white">Selection Vector: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Pending Allocation'}</p>
           {!boardingPoint || !droppingPoint ? (
             <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 animate-pulse mt-1">Error: Terminals must be defined for manifest validation</p>
           ) : (
             <p className="text-[8px] font-black uppercase tracking-widest text-teal-400/60 mt-1">Route synchronized via {boardingPoint} hub</p>
           )}
        </div>
      </div>
    </div>
  );
}
