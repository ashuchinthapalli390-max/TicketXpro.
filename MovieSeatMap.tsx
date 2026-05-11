import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Armchair, Info, Coffee, Wine, IceCream, Lock, Clock, X, CircleDashed } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Schedule } from '../../types';

interface MovieSeatMapProps {
  node: BookingNode;
  onUpdate: (selection: { seats: string[], refreshments: Record<string, number>, total: number }) => void;
}

const TIERS = [
  { id: 'vip', label: 'VIP RECLINER', priceMulti: 1.5, color: 'text-amber-400', bg: 'bg-amber-400/10', borderColor: 'border-amber-400/40', rows: ['A', 'B'] },
  { id: 'gold', label: 'PREMIUM GOLD', priceMulti: 1.2, color: 'text-yellow-400', bg: 'bg-yellow-400/10', borderColor: 'border-yellow-400/30', rows: ['C', 'D'] },
  { id: 'silver', label: 'STANDARD SILVER', priceMulti: 1.0, color: 'text-teal-400', bg: 'bg-teal-400/5', borderColor: 'border-teal-400/20', rows: ['E', 'F', 'G', 'H'] }
];

const FB_MENU = [
  { 
    id: 'popcorn', 
    label: 'Cyber Corn', 
    sub: 'Butter Salted',
    price: 250, 
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'soda', 
    label: 'Neon Fizz', 
    sub: 'Cold Beverage',
    price: 180, 
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'nachos', 
    label: 'Atomic Nachos', 
    sub: 'Cheese Dip',
    price: 320, 
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'burger', 
    label: 'Bunker Burger', 
    sub: 'Chicken Patty',
    price: 380, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'pizza', 
    label: 'Matrix Slice', 
    sub: 'Classic Cheese',
    price: 290, 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'icecream', 
    label: 'Sub-Zero', 
    sub: 'Vanilla Gelato',
    price: 210, 
    image: 'https://images.unsplash.com/photo-1567206491228-591aef594681?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'coffee', 
    label: 'Code Coffee', 
    sub: 'Black Espresso',
    price: 150, 
    image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'sandwich', 
    label: 'Silicon Club', 
    sub: 'Veggies & Cheese',
    price: 240, 
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'juice', 
    label: 'Fresh Byte', 
    sub: 'Nature Pressed',
    price: 120, 
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400' 
  }
];

export default function MovieSeatMap({ node, onUpdate }: MovieSeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [holdingSeats, setHoldingSeats] = useState<Record<string, number>>({});
  const [showFB, setShowFB] = useState(false);
  const [refreshments, setRefreshments] = useState<Record<string, number>>({});
  const [shakingSeat, setShakingSeat] = useState<string | null>(null);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeHolding = Object.entries(holdingSeats)
    .filter(([_, expiry]) => expiry > now)
    .map(([id]) => id);

  // Real-time synchronization for booked seats
  useEffect(() => {
    if (!node.id) return;
    
    // Listen to the schedule document for real-time seat availability
    const unsubscribe = onSnapshot(doc(db, 'schedules', node.id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Schedule;
        setBookedSeats(new Set(data.bookedSeats || []));
      }
    }, (error) => {
      console.error("Error listening to seat updates:", error);
    });

    return () => unsubscribe();
  }, [node.id]);

  const calculateTotalWithSelection = (seats: string[], fb: Record<string, number>) => {
    let seatTotal = 0;
    seats.forEach(seat => {
      const row = seat ? seat.charAt(0) : 'A';
      const tier = TIERS.find(t => t.rows.includes(row));
      if (tier) {
        seatTotal += node.price * tier.priceMulti;
      }
    });

    let fbTotal = 0;
    Object.entries(fb).forEach(([id, count]) => {
      const item = FB_MENU.find(m => m.id === id);
      if (item) fbTotal += item.price * count;
    });

    return seatTotal + fbTotal;
  };

  const calculateTotal = () => {
    return calculateTotalWithSelection(selectedSeats, refreshments);
  };

  const toggleSeat = (id: string) => {
    if (bookedSeats.has(id)) {
      setShakingSeat(id);
      setTimeout(() => setShakingSeat(null), 500);
      return;
    }

    let nextSeats: string[];
    if (selectedSeats.includes(id)) {
      nextSeats = selectedSeats.filter(s => s !== id);
      setHoldingSeats(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      nextSeats = [...selectedSeats, id];
      // Simulation of temporary reservation expire (5 minutes)
      const expiry = Date.now() + 300000;
      setHoldingSeats(prev => ({ ...prev, [id]: expiry }));
    }
    
    setSelectedSeats(nextSeats);
    const nextTotal = calculateTotalWithSelection(nextSeats, refreshments);
    onUpdate({ seats: nextSeats, refreshments, total: nextTotal });
  };

  const getTierDetails = () => {
    const counts: Record<string, number> = {};
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);
      const tier = TIERS.find(t => t.rows.includes(row));
      if (tier) {
        counts[tier.id] = (counts[tier.id] || 0) + 1;
      }
    });
    return counts;
  };

  const updateFB = (id: string, delta: number) => {
    const current = refreshments[id] || 0;
    const nextVal = Math.max(0, current + delta);
    const next = { ...refreshments, [id]: nextVal };
    if (nextVal === 0) delete next[id];
    
    setRefreshments(next);
    const nextTotal = calculateTotalWithSelection(selectedSeats, next);
    onUpdate({ seats: selectedSeats, refreshments: next, total: nextTotal });
  };

  return (
    <div className="space-y-10">
      {/* Screen SVG */}
      <div className="relative w-full max-w-3xl mx-auto py-12">
        <svg viewBox="0 0 100 12" className="w-full drop-shadow-[0_0_30px_rgba(45,212,191,0.2)]">
          <path 
            d="M 5,10 Q 50,0 95,10" 
            fill="none" 
            stroke="url(#screenGradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
           <p className="text-[10px] font-black uppercase text-teal-400/40 tracking-[1em] mb-1">Optical Interface</p>
           <div className="w-1.5 h-1.5 rounded-full bg-teal-400/20 blur-[2px] animate-pulse" />
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col gap-10 items-center">
        {TIERS.map(tier => (
          <div key={tier.id} className="space-y-6 w-full">
            <div className="flex items-center gap-6 px-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-teal-900/20 to-teal-900/40" />
              <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 border rounded-sm flex items-center gap-3", tier.color, tier.bg, tier.borderColor)}>
                <Armchair size={12} /> {tier.label} <span className="text-white/20">|</span> ₹{(node.price * tier.priceMulti).toLocaleString()}
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-teal-900/20 to-teal-900/40" />
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              {tier.rows.map(row => (
                <div key={row} className="flex gap-2.5 items-center">
                  <span className="w-6 text-[10px] font-black text-secondary/20 font-mono tracking-tighter">{row}</span>
                  {Array.from({ length: 14 }).map((_, i) => {
                    const id = `${row}${i + 1}`;
                    const isSelected = selectedSeats.includes(id);
                    const isBooked = bookedSeats.has(id);
                    const isHolding = activeHolding.includes(id);
                    const isGap = i === 2 || i === 10;
                    const isShaking = shakingSeat === id;
                    const expiry = holdingSeats[id];
                    const timeRemaining = expiry ? Math.max(0, expiry - now) : 0;
                    const formatTime = (ms: number) => {
                      const s = Math.floor(ms / 1000);
                      const m = Math.floor(s / 60);
                      return `${m}:${(s % 60).toString().padStart(2, '0')}`;
                    };

                    return (
                      <React.Fragment key={id}>
                        <motion.button
                          animate={isShaking ? { 
                            x: [-2, 2, -2, 2, 0],
                            borderColor: ['rgba(255,255,255,0.05)', '#ef4444', 'rgba(255,255,255,0.05)']
                          } : {}}
                          transition={{ duration: 0.4 }}
                          whileHover={!isBooked ? { scale: 1.15, y: -1 } : {}}
                          whileTap={!isBooked ? { scale: 0.95 } : {}}
                          onClick={() => toggleSeat(id)}
                          className={cn(
                            "w-6 h-6 md:w-8 md:h-8 rounded-[4px] border transition-all duration-300 flex items-center justify-center relative group",
                            isBooked
                              ? "bg-white/5 border-white/5 text-white/5 cursor-not-allowed" 
                              : isSelected 
                                ? "bg-teal-400 border-teal-400 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)] z-10" 
                                : isHolding
                                  ? "bg-amber-400/20 border-amber-400 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                                  : "bg-black/40 border-white/5 text-white/10 hover:border-teal-400/30 hover:text-teal-400/50"
                          )}
                        >
                          {isBooked ? (
                            <Lock size={12} className="opacity-20" />
                          ) : isHolding ? (
                            <div className="flex flex-col items-center">
                              <Clock size={10} className="animate-pulse" />
                              <span className="text-[5px] font-black absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-1 rounded-full whitespace-nowrap">
                                {formatTime(timeRemaining)}
                              </span>
                            </div>
                          ) : isSelected ? (
                            <Armchair size={16} fill="currentColor" />
                          ) : (
                            <CircleDashed size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                          )}
                          
                          {isBooked && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <X size={16} className="text-red-500/20" />
                            </div>
                          ) || isShaking && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black py-1 px-2 rounded-sm whitespace-nowrap z-50 shadow-2xl animate-bounce">
                               ACCESS_DENIED :: LOCKED
                             </div>
                          )}
                        </motion.button>
                        {isGap && <div className="w-5 md:w-10" />}
                      </React.Fragment>
                    );
                  })}
                  <span className="w-6 text-[10px] font-black text-secondary/20 font-mono tracking-tighter text-right">{row}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-8 justify-center pb-8 border-b border-teal-900/10 flex-wrap">
         {[
           { label: 'Available', class: 'bg-black/60 border-white/10', icon: CircleDashed },
           { label: 'Selected', class: 'bg-teal-400 border-teal-400', icon: Armchair },
           { label: 'Holding', class: 'bg-amber-400/20 border-amber-400', icon: Clock },
           { label: 'Locked/Others', class: 'bg-white/5 border-white/5 opacity-40', icon: Lock }
         ].map(l => (
           <div key={l.label} className="flex items-center gap-2">
              <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center", l.class)}>
                 <l.icon size={10} className={l.label === 'Selected' ? 'text-black' : ''} />
              </div>
              <span className="text-[9px] font-black uppercase text-secondary/40 tracking-widest">{l.label}</span>
           </div>
         ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-teal-400/5 border border-teal-400/20 rounded-2xl gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-400/10 rounded-full flex items-center justify-center text-teal-400">
             <Info size={24} />
          </div>
          <div className="text-left">
             <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">Tactical Selection Active</p>
             <p className="text-[8px] font-black uppercase text-teal-400/40 tracking-[0.2em] leading-relaxed max-w-xs">
               Select units to proceed. Encrypted total includes seat tier multipliers and provision surcharges.
             </p>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end gap-1">
           <span className="text-[8px] font-black uppercase text-secondary/40 tracking-[0.4em]">Current Vector Total</span>
           <div className="flex items-baseline gap-2">
              <span className="text-xs font-black text-teal-400/60 uppercase">INR</span>
              <span className="text-4xl font-black text-white tracking-tighter">₹{calculateTotal().toLocaleString()}</span>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col gap-4 p-8 bg-black/60 border border-teal-900/20 rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-teal-900/10 pb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Selection Vector Breakdown</h4>
              <div className="flex flex-wrap gap-2 justify-end max-w-[60%]">
                {selectedSeats.sort().map(s => (
                  <span key={s} className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-sm">{s}</span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(getTierDetails()).map(([tierId, count]) => {
                const tier = TIERS.find(t => t.id === tierId);
                return (
                  <div key={tierId} className="space-y-1">
                    <p className={cn("text-[8px] font-black uppercase tracking-widest", tier?.color)}>{tier?.label}</p>
                    <p className="text-sm font-black text-white">{count} Units <span className="text-[10px] text-white/20 font-medium">@ ₹{(node.price * (tier?.priceMulti || 1)).toLocaleString()}</span></p>
                  </div>
                );
              })}
              
              {Object.entries(refreshments).length > 0 && (
                <div className="space-y-1 col-span-full pt-4 border-t border-teal-900/10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary">Provisions Sub-selection</p>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(refreshments).map(([id, count]) => {
                      const item = FB_MENU.find(m => m.id === id);
                      return (
                        <span key={id} className="text-[10px] text-white/60 font-black uppercase">
                          {item?.label} <span className="text-primary italic">x{count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-teal-900/5 border border-teal-900/20 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-all" />
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-10">
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
               <Coffee className="text-primary" size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">Refreshments Protocol</h4>
              <p className="text-[9px] text-secondary/40 font-black uppercase tracking-widest mt-1 italic">Pre-order for optimized delivery</p>
            </div>
          </div>
          <button 
            onClick={() => setShowFB(!showFB)}
            className={cn(
              "px-8 py-3 text-[9px] font-black uppercase tracking-[0.4em] rounded-sm transition-all border shadow-lg",
              showFB ? "bg-white text-black border-white" : "border-teal-900/30 text-secondary/40 hover:text-white"
            )}
          >
            {showFB ? 'Decline Menu' : 'Access Provisions'}
          </button>
        </div>

        <AnimatePresence>
          {showFB && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {FB_MENU.map(item => {
                const count = refreshments[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group/item rounded-2xl border transition-all duration-500 flex flex-col relative overflow-hidden",
                      count > 0 ? "bg-primary/5 border-primary ring-1 ring-primary/20" : "bg-black/40 border-teal-900/10 hover:border-primary/30"
                    )}
                  >
                    <div className="relative h-32 overflow-hidden">
                       <img 
                        src={item.image} 
                        alt={item.label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                        referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                       <div className="absolute bottom-3 left-4">
                          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">{item.label}</h5>
                          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{item.sub}</p>
                       </div>
                    </div>

                    <div className="p-4 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">₹{item.price}</span>
                            <span className="text-[7px] font-black text-secondary/40 uppercase tracking-widest">+ Tax</span>
                         </div>
                         
                         <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1.5 border border-teal-900/10">
                            <button 
                              onClick={() => updateFB(item.id, -1)}
                              className="w-7 h-7 rounded-lg border border-teal-900/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-white w-6 text-center font-mono">{count}</span>
                            <button 
                              onClick={() => updateFB(item.id, 1)}
                              className="w-7 h-7 rounded-lg border border-teal-900/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
                            >
                              +
                            </button>
                         </div>
                      </div>
                    </div>

                    {count > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-full">
                         {count} Added
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 justify-center p-6 bg-teal-400/5 border border-teal-400/20 rounded-2xl">
        <div className="w-10 h-10 bg-teal-400/10 rounded-full flex items-center justify-center text-teal-400">
           <Info size={18} />
        </div>
        <div className="text-left">
           <p className="text-[10px] font-black uppercase text-white tracking-widest mb-1">Tactical Selection Active</p>
           <p className="text-[8px] font-black uppercase text-teal-400/40 tracking-[0.2em] leading-relaxed">
             Select units to proceed. Encrypted total includes seat tier multipliers and provision surcharges.
           </p>
        </div>
      </div>
    </div>
  );
}

