import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Armchair, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';

interface FlightLayoutProps {
  node: BookingNode;
  onSeatSelect: (seats: string[]) => void;
}

export default function FlightLayout({ node, onSeatSelect }: FlightLayoutProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatClass, setSeatClass] = useState<'Economy' | 'Business'>('Economy');

  const toggleSeat = (id: string) => {
    const next = selectedSeats.includes(id) 
      ? selectedSeats.filter(s => s !== id) 
      : [...selectedSeats, id];
    setSelectedSeats(next);
    onSeatSelect(next);
  };

  const rows = seatClass === 'Business' ? 4 : 15;
  const cols = seatClass === 'Business' ? ['A', 'B', 'E', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-8">
      <div className="flex justify-center bg-black/60 p-1 rounded-full border border-teal-900/20 w-fit mx-auto">
        {(['Business', 'Economy'] as const).map((type) => (
          <button 
            key={type}
            onClick={() => { setSeatClass(type); setSelectedSeats([]); onSeatSelect([]); }}
            className={cn(
              "px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              seatClass === type ? "bg-primary text-black" : "text-secondary/40 hover:text-white"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="relative bg-dark/40 p-8 rounded-[3rem] border border-teal-900/10 max-w-md mx-auto overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-secondary/20 tracking-[0.5em]">Flight Deck</div>
        
        <div className="space-y-4 mt-8">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {cols.slice(0, cols.length / 2).map(c => {
                  const id = `${r + 1}${c}`;
                  const isSelected = selectedSeats.includes(id);
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSeat(id)}
                      className={cn(
                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary text-black shadow-lg" : "bg-black/40 border-teal-900/20 text-secondary/40 hover:border-primary/40"
                      )}
                    >
                      <Armchair size={14} />
                    </motion.button>
                  );
                })}
              </div>
              
              <span className="text-[10px] font-black text-secondary/20">{r + 1}</span>
              
              <div className="flex gap-2">
                {cols.slice(cols.length / 2).map(c => {
                  const id = `${r + 1}${c}`;
                  const isSelected = selectedSeats.includes(id);
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSeat(id)}
                      className={cn(
                        "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary text-black shadow-lg" : "bg-black/40 border-teal-900/20 text-secondary/40 hover:border-primary/40"
                      )}
                    >
                      <Armchair size={14} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <Plane size={16} className="text-primary" />
        <div className="text-left">
           <p className="text-[10px] font-black uppercase tracking-widest text-white">Boarding Priority: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Waiting Allocation'}</p>
           <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40 mt-1">Class: {seatClass} Entry Sequence Authorized</p>
        </div>
      </div>
    </div>
  );
}
