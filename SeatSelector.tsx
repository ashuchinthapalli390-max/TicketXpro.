import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, AnimatePresence } from 'motion/react';
import { useGesture } from '@use-gesture/react';
import { Seat, SeatStatus } from '../types';
import { cn } from '../lib/utils';
import { Armchair, ChevronRight, MapPin, Clock, Info, Loader2, AlertCircle } from 'lucide-react';
import { BookingNode } from '../services/entertainmentService';

interface SeatSelectorProps {
  category: string;
  onSeatSelect: (seats: string[]) => void;
  node?: BookingNode;
}

export default function SeatSelector({ category, onSeatSelect, node }: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [tempReservations, setTempReservations] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTierFilter, setActiveTierFilter] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock some booked and reserved seats for realism
  const bookedSeats = React.useMemo(() => ['A1', 'A2', 'C4', 'C5', 'F1', 'F10', 'B3'], []);
  const otherReservedSeats = React.useMemo(() => ['B1', 'B2', 'B6', 'E4', 'E5'], []);

  // Animation values for zoom and pan
  const scale = useSpring(1, { stiffness: 300, damping: 30 });
  const x = useSpring(0, { stiffness: 300, damping: 30 });
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  // Native-like pinch-to-zoom and panning
  useGesture(
    {
      onPinch: ({ offset: [d], origin: [ox, oy], first, memo }) => {
        if (first) {
          const { left, top } = containerRef.current!.getBoundingClientRect();
          return { ox: ox - left, oy: oy - top };
        }
        scale.set(d);
        return memo;
      },
      onDrag: ({ offset: [dx, dy] }) => {
        x.set(dx);
        y.set(dy);
      },
    },
    {
      target: containerRef,
      pinch: { scaleBounds: { min: 0.5, max: 2.5 }, modifierKey: 'ctrlKey' },
      drag: { filterTaps: true, bounds: { left: -200, right: 200, top: -200, bottom: 200 } }
    }
  );

  // Use an interval to clear expired reservations
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const clearError = () => setErrorMessage(null);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const activeReservations = Object.entries(tempReservations)
    .filter(([_, expiry]) => expiry > now)
    .map(([id]) => id);

  // Adaptive grid based on category
  const tiers = [
    { name: 'Executive Recliners', rows: ['F', 'E'], price: 450, color: 'text-purple-400', bg: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    { name: 'Prime Plus', rows: ['D', 'C'], price: 300, color: 'text-blue-400', bg: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    { name: 'Value Standard', rows: ['B', 'A'], price: 150, color: 'text-teal-400', bg: 'bg-teal-500/10', borderColor: 'border-teal-500/30' }
  ];

  const rows = ['F', 'E', 'D', 'C', 'B', 'A']; // Order for rendering (back to front)
  const cols = Array.from({ length: category === 'Cinema & Events' || category === 'movie' ? 10 : 8 }, (_, i) => i + 1);

  const [shakingSeat, setShakingSeat] = useState<string | null>(null);

  const getSeatTier = (row: string) => tiers.find(t => t.rows.includes(row));

  const toggleSeat = (id: string) => {
    if (bookedSeats.includes(id)) {
      setErrorMessage("This seat is already booked by another user.");
      setShakingSeat(id);
      setTimeout(() => setShakingSeat(null), 400);
      return;
    }
    
    if (otherReservedSeats.includes(id)) {
      setErrorMessage("This seat is currently held by a guest.");
      setShakingSeat(id);
      setTimeout(() => setShakingSeat(null), 400);
      return;
    }
    
    // If it's already in temp reservations, unselect/unreserve it
    if (activeReservations.includes(id)) {
       setTempReservations(prev => {
         const next = { ...prev };
         delete next[id];
         return next;
       });
       const nextSelected = selectedSeats.filter(s => s !== id);
       setSelectedSeats(nextSelected);
       onSeatSelect(nextSelected);
       return;
    }

    const nextSelected = selectedSeats.includes(id) ? selectedSeats.filter(s => s !== id) : [...selectedSeats, id];
    setSelectedSeats(nextSelected);
    // Notify parent
    onSeatSelect(nextSelected.concat(activeReservations)); 
  };

  const holdSelectedSeats = () => {
     if (selectedSeats.length === 0) return;
     const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
     const newReservations = { ...tempReservations };
     selectedSeats.forEach(id => {
       newReservations[id] = expiry;
     });
     setTempReservations(newReservations);
     const reservationsOnly = [...activeReservations, ...selectedSeats];
     onSeatSelect(reservationsOnly);
     setSelectedSeats([]); // clear active selections, they are now reserved
  };

  const formatTime = (ms: number) => {
     if (ms <= 0) return '0:00';
     const totalSeconds = Math.floor(ms / 1000);
     const m = Math.floor(totalSeconds / 60);
     const s = totalSeconds % 60;
     return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Find min expiry time among user reservations
  const activeReservationExpiryList = Object.values(tempReservations).filter(expiry => expiry > now);
  const minExpiry = activeReservationExpiryList.length > 0 ? Math.min(...activeReservationExpiryList) : null;
  const timeRemaining = minExpiry ? minExpiry - now : 0;

  if (isLoading) {
    return (
      <div className="w-full h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-950/80 rounded-[2.5rem] border border-white/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Scanning Field...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-col flex items-center gap-4 relative">
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 z-50 px-6 py-3 bg-red-500/10 border border-red-500/50 rounded-full backdrop-blur-xl flex items-center gap-2"
          >
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top action bar: Location and Hold Button */}
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gray-900/40 rounded-2xl border border-white/5 gap-6">
        <div className="flex-1">
          {node?.venue && (
            <div className="flex items-center gap-3 mb-2 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
              <MapPin size={16} /> 
              <span>{node.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            <Info size={14} className="text-primary/40" /> 
            <span>Select up to 10 units. Temporary hold available for verified users.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {minExpiry && (
             <div className="flex flex-col items-end px-4 border-r border-white/5">
               <span className="text-[9px] text-amber-500 font-black uppercase tracking-[0.3em] mb-1">Hold Expiry</span>
               <span className="text-xl text-amber-500 font-black font-mono leading-none">{formatTime(timeRemaining)}</span>
             </div>
          )}
          <button 
            onClick={holdSelectedSeats}
            disabled={selectedSeats.length === 0}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-lg",
              selectedSeats.length > 0 
                ? "bg-primary text-black shadow-primary/20 hover:opacity-90" 
                : "bg-gray-800 text-gray-500 border border-white/5 opacity-50 cursor-not-allowed"
            )}
          >
            <Clock size={16} /> Hold Selection
          </button>
        </div>
      </div>

      <div className="w-full select-none overflow-hidden h-[500px] lg:h-[600px] cursor-grab active:cursor-grabbing touch-none relative bg-gray-950/80 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div className="flex flex-col items-center gap-10 lg:gap-16 h-full py-12">
          {/* Cinematic Screen Indicator */}
          <div className="w-full max-w-2xl relative px-10">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-[100%] scale-x-150 -translate-y-12" />
            <motion.div 
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="h-2 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full shadow-[0_15px_40px_rgba(242,125,38,0.3)]" 
            />
            <div className="text-[10px] uppercase font-black tracking-[0.8em] text-primary/30 text-center mt-10">
              <span className="bg-black/40 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">Tactical Field View</span>
            </div>
          </div>

          {/* Adaptive Seat Matrix with touch-panning and zoom */}
          <div className="relative flex-1 w-full flex items-center justify-center perspective-[1200px]">
            <motion.div 
              ref={containerRef}
              style={{ scale, x, y, rotateX: 20 }}
              className="flex flex-col gap-12 p-20 bg-gray-900/20 rounded-[4rem] relative border border-white/5 shadow-2xl backdrop-blur-xl"
            >
              {/* Perspective Shadows */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80 pointer-events-none rounded-[4rem]" />
              
              {tiers.map((tier, tIdx) => (
                <div key={tier.name} className="flex flex-col gap-6 relative">
                  {/* Tier Labeling with Divider */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className={cn("h-[1px] flex-1 bg-gradient-to-r from-transparent to-transparent", tier.borderColor.replace('border', 'via'))} />
                    <div className={cn(
                      "px-6 py-2 border rounded-2xl flex items-center gap-3 backdrop-blur-xl transition-all shadow-xl",
                      tier.bg, tier.borderColor
                    )}>
                      <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor] animate-pulse", tier.color)} />
                      <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", tier.color)}>
                        {tier.name} <span className="mx-2 opacity-30">/</span> ₹{tier.price}
                      </span>
                    </div>
                    <div className={cn("h-[1px] flex-1 bg-gradient-to-l from-transparent to-transparent", tier.borderColor.replace('border', 'via'))} />
                  </div>

                  {tier.rows.map(row => (
                    <div key={row} className="flex gap-4 lg:gap-6 items-center">
                      <span className="w-8 text-[11px] font-black text-white/10 font-mono select-none tracking-tighter">{row}</span>
                      <div className="flex gap-4 lg:gap-6 justify-center">
                        {cols.map(col => {
                          const id = `${row}${col}`;
                          const isSelected = selectedSeats.includes(id);
                          const isBooked = bookedSeats.includes(id);
                          const isSystemReserved = otherReservedSeats.includes(id);
                          const isUserReserved = activeReservations.includes(id);
                          const isGap = col === Math.ceil(cols.length / 2);
                          const seatTier = getSeatTier(row);
                          const isFilteredOut = activeTierFilter && seatTier?.name !== activeTierFilter;

                          const getStatusLabel = () => {
                            if (isBooked) return 'booked';
                            if (isSystemReserved) return 'locked';
                            if (isUserReserved) return 'held';
                            if (isSelected) return 'selected';
                            return 'available';
                          };

                          return (
                            <React.Fragment key={id}>
                              <motion.button
                                whileHover={!(isBooked || isSystemReserved) ? { 
                                  scale: 1.25, 
                                  translateY: -5, 
                                  boxShadow: "0 20px 40px rgba(242,125,38,0.2)"
                                } : {}}
                                whileTap={!(isBooked || isSystemReserved) ? { scale: 0.9 } : {}}
                                animate={shakingSeat === id ? {
                                  x: [0, -6, 6, -6, 6, 0],
                                  scale: [1, 1.05, 1],
                                  borderColor: ["rgba(255,255,255,0.05)", "#ef4444", "rgba(255,255,255,0.05)"],
                                  backgroundColor: ["rgba(220, 38, 38, 0)", "rgba(220, 38, 38, 0.1)", "rgba(220, 38, 38, 0)"],
                                } : isSelected ? {
                                  scale: [1, 1.15, 1],
                                  boxShadow: ["0 0 0px rgba(242,125,38,0)", "0 0 30px rgba(242,125,38,0.4)", "0 0 15px rgba(242,125,38,0.2)"]
                                } : {}}
                                transition={{ 
                                  duration: 0.4, 
                                  ease: "easeInOut",
                                  scale: { type: "spring", stiffness: 400, damping: 15 }
                                }}
                                onClick={() => toggleSeat(id)}
                                aria-label={`Seat ${id}, ${getStatusLabel()}`}
                                title={`Seat ${id} (${getStatusLabel()})`}
                                className={cn(
                                  "w-10 h-10 lg:w-12 lg:h-12 rounded-xl border transition-all duration-500 flex items-center justify-center text-[11px] font-black shrink-0 relative overflow-hidden group/seat",
                                  isBooked ? "bg-white/5 border-white/5 text-white/5 cursor-not-allowed grayscale" :
                                  isSystemReserved ? "bg-white/10 border-white/10 text-white/20 cursor-not-allowed" :
                                  isUserReserved ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" :
                                  isSelected 
                                    ? "bg-primary border-primary text-black z-10 shadow-[0_10px_30px_rgba(242,125,38,0.4)]" 
                                    : "bg-gray-800/40 border-white/5 text-white/10 hover:border-primary/50 hover:bg-gray-800/80",
                                  isFilteredOut && "opacity-20 scale-90 translate-y-2 pointer-events-none grayscale"
                                )}
                              >
                                <Armchair 
                                  size={18} 
                                  className={cn(
                                    "transition-all duration-500", 
                                    isSelected ? "text-black scale-110 drop-shadow-md" : 
                                    isBooked ? "text-white/5" : 
                                    isSystemReserved ? "text-white/10" :
                                    isUserReserved ? "text-amber-500 animate-pulse" :
                                    "text-white/20 group-hover/seat:text-primary group-hover/seat:scale-110"
                                  )} 
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0 group-hover/seat:opacity-100 transition-opacity" />

                                {isSelected && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 bg-white/10 pointer-events-none"
                                  />
                                )}
                                {isUserReserved && (
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 z-20">
                                    <Clock size={10} className="text-amber-500 animate-pulse" />
                                    <span className="text-[8px] font-mono text-amber-500 tabular-nums font-black">
                                      {formatTime(tempReservations[id] - now)}
                                    </span>
                                  </div>
                                )}
                                {isBooked && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                     <div className="w-5 h-[1.5px] bg-white/20 rotate-45" />
                                     <div className="w-5 h-[1.5px] bg-white/20 -rotate-45" />
                                  </div>
                                )}
                                
                                {/* Slot Identifier - Hidden by default, shown on hover/select */}
                                <div className={cn(
                                  "absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 text-[6px] font-black uppercase tracking-tighter transition-all rounded-sm",
                                  isSelected ? "bg-black text-primary opacity-100" : "opacity-0 group-hover/seat:opacity-100 text-white/40"
                                )}>
                                  {id}
                                </div>
                              </motion.button>
                              {isGap && <div className="w-6 lg:w-12" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Legend Implementation */}
          <div className="w-full max-w-4xl px-8 flex flex-col gap-10">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-[10px] uppercase font-black tracking-[0.2em]">
               <div className="flex items-center gap-3 text-gray-500">
                 <div className="w-5 h-5 rounded-lg border border-white/10 bg-gray-800/40 flex items-center justify-center">
                   <Armchair size={10} className="text-white/20" />
                 </div>
                 Available
               </div>
               <div className="flex items-center gap-3 text-primary">
                 <div className="w-5 h-5 rounded-lg bg-primary border-primary shadow-[0_0_15px_rgba(242,125,38,0.3)] flex items-center justify-center">
                   <Armchair size={10} className="text-black" />
                 </div>
                 Selected
               </div>
               <div className="flex items-center gap-3 text-amber-500">
                 <div className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500 flex items-center justify-center">
                   <Armchair size={10} className="text-amber-500" />
                 </div>
                 Holding
               </div>
               <div className="flex items-center gap-3 text-gray-700">
                 <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center opacity-40">
                   <div className="relative w-full h-full flex items-center justify-center">
                     <Armchair size={10} className="text-white/10" />
                     <div className="absolute inset-1.5 border-t border-white/20 rotate-45" />
                   </div>
                 </div>
                 Booked
               </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-10">
              {tiers.map(tier => (
                <button 
                  key={tier.name} 
                  onClick={() => setActiveTierFilter(activeTierFilter === tier.name ? null : tier.name)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all border outline-none",
                    activeTierFilter === tier.name 
                      ? "bg-white/10 border-white/20 shadow-xl scale-105" 
                      : "bg-transparent border-transparent hover:bg-white/5 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", tier.color, tier.color.replace('text', 'bg'))} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", tier.color)}>{tier.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
