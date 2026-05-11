import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bed, Calendar, Users, Star, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';

interface HotelLayoutProps {
  node: BookingNode;
  onUpdate: (data: any) => void;
}

const ROOM_TYPES = [
  { id: 'standard', name: 'Standard Unit', price: 1, icon: Bed, description: 'Comfortable stay with basic amenities' },
  { id: 'deluxe', name: 'Deluxe Suite', price: 1.5, icon: Star, description: 'Spacious room with city view' },
  { id: 'executive', name: 'Executive Lounge', price: 2.2, icon: Users, description: 'Top floor luxury with private access' }
];

export default function HotelLayout({ node, onUpdate }: HotelLayoutProps) {
  const [roomType, setRoomType] = useState('standard');
  const [guests, setGuests] = useState(2);
  const [stayDuration, setStayDuration] = useState(1);

  const handleUpdate = (updates: any) => {
    const newData = { roomType, guests, stayDuration, ...updates };
    const room = ROOM_TYPES.find(r => r.id === newData.roomType);
    const total = node.price * (room?.price || 1) * newData.stayDuration;
    onUpdate({ ...newData, total });
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stay Details */}
        <div className="space-y-6 text-left">
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em] ml-1">Occupancy Count</label>
             <div className="flex items-center gap-4 bg-black/40 border border-teal-900/20 p-2 rounded-xl">
                <button 
                  onClick={() => { if(guests > 1) { setGuests(prev => prev - 1); handleUpdate({ guests: guests - 1 }); } }}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-black"
                >-</button>
                <div className="flex-1 text-center font-black text-white text-sm">{guests} GUESTS</div>
                <button 
                  onClick={() => { setGuests(prev => prev + 1); handleUpdate({ guests: guests + 1 }); }}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-black"
                >+</button>
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em] ml-1">Duration of Stay (Nights)</label>
             <div className="flex items-center gap-4 bg-black/40 border border-teal-900/20 p-2 rounded-xl">
                <button 
                  onClick={() => { if(stayDuration > 1) { setStayDuration(prev => prev - 1); handleUpdate({ stayDuration: stayDuration - 1 }); } }}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-black"
                >-</button>
                <div className="flex-1 text-center font-black text-white text-sm">{stayDuration} NIGHTS</div>
                <button 
                  onClick={() => { setStayDuration(prev => prev + 1); handleUpdate({ stayDuration: stayDuration + 1 }); }}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white font-black"
                >+</button>
             </div>
          </div>
        </div>

        {/* Room type selection */}
        <div className="space-y-5">
           <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em] block text-left ml-1">Configuration Type</label>
           <div className="space-y-3">
              {ROOM_TYPES.map((room) => {
                const isSelected = roomType === room.id;
                const Icon = room.icon;
                return (
                  <button
                    key={room.id}
                    onClick={() => { setRoomType(room.id); handleUpdate({ roomType: room.id }); }}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group text-left",
                      isSelected ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-black/40 border-teal-900/10 hover:border-primary/40"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isSelected ? "bg-white/20 text-black" : "bg-white/5 text-primary group-hover:bg-primary/10"
                    )}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-xs font-black uppercase", isSelected ? "text-black" : "text-white")}>{room.name}</p>
                      <p className={cn("text-[8px] uppercase tracking-wider mt-0.5", isSelected ? "text-black/60" : "text-secondary/40")}>{room.description}</p>
                    </div>
                    <div className={cn("text-right font-black", isSelected ? "text-black" : "text-primary")}>
                       x{room.price}
                    </div>
                  </button>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-teal-400/5 border border-teal-400/20 rounded-2xl text-left">
         <Info size={18} className="text-teal-400 flex-shrink-0" />
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Allocation Protocol Active</p>
            <p className="text-[8px] font-black uppercase tracking-widest text-secondary/40 mt-1">Check-in synchronized with local bio-metrics. Guests: {guests} | Type: {roomType}</p>
         </div>
      </div>
    </div>
  );
}
