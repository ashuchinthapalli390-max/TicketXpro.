import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Info, Users, Crown, Zap, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';

interface EventTicketTierProps {
  node: BookingNode;
  onSeatSelect: (seats: string[]) => void;
}

const TIERS = [
  { 
    id: 'ga', 
    label: 'General Admission', 
    priceMulti: 1.0, 
    icon: Users,
    perks: ['Standard Entry', 'F&B Access', 'Public Arena'],
    remaining: 'Sold Out Soon'
  },
  { 
    id: 'vip', 
    label: 'VIP Access', 
    priceMulti: 2.5, 
    icon: Crown,
    perks: ['Queue Jump', 'VIP Lounge', '1 Free Welcome Drink', 'Premium View'],
    remaining: 'Limited'
  },
  { 
    id: 'backstage', 
    label: 'Backstage Pass', 
    priceMulti: 5.0, 
    icon: Zap,
    perks: ['Backstage Access', 'Meet & Greet', 'Merchandise Kit', 'Buffet Dinner'],
    remaining: 'Only 5 Left'
  }
];

export default function EventTicketTier({ node, onSeatSelect }: EventTicketTierProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleSelect = (id: string) => {
    setSelectedTier(id);
    onSeatSelect(Array.from({ length: quantity }, (_, i) => `${id}-${i + 1}`));
  };

  const updateQuantity = (q: number) => {
    const nextQ = Math.max(1, Math.min(10, q));
    setQuantity(nextQ);
    if (selectedTier) {
      onSeatSelect(Array.from({ length: nextQ }, (_, i) => `${selectedTier}-${i + 1}`));
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 p-6 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Star size={100} />
        </div>
        <div className="text-left relative z-10">
          <h3 className="text-lg font-black uppercase italic italic text-white tracking-widest">{node.title}</h3>
          <p className="text-[10px] text-secondary/40 font-black uppercase tracking-widest mt-1">Live Deployment Protocol Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map(tier => {
          const Icon = tier.icon;
          const isActive = selectedTier === tier.id;
          const price = node.price * tier.priceMulti;
          return (
            <motion.button
              key={tier.id}
              whileHover={{ y: -10 }}
              onClick={() => handleSelect(tier.id)}
              className={cn(
                "p-8 rounded-3xl border transition-all flex flex-col items-center text-center gap-6 relative overflow-hidden group",
                isActive 
                  ? "bg-primary border-primary shadow-[0_0_30px_rgba(242,125,38,0.3)]" 
                  : "bg-dark/60 border-teal-900/30 hover:border-primary/50"
              )}
            >
              {isActive && (
                 <div className="absolute top-0 right-0 p-4">
                    <Check size={20} className="text-black" />
                 </div>
              )}
              
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                isActive ? "bg-black text-primary" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black"
              )}>
                <Icon size={32} />
              </div>

              <div>
                <h4 className={cn("text-sm font-black uppercase tracking-widest mb-1", isActive ? "text-black" : "text-white")}>{tier.label}</h4>
                <p className={cn("text-[8px] font-black uppercase tracking-[0.2em]", isActive ? "text-black/60" : "text-primary")}>{tier.remaining}</p>
              </div>

              <div className="space-y-2 w-full">
                {tier.perks.map(perk => (
                  <div key={perk} className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", isActive ? "text-black/70" : "text-secondary/40")}>
                    <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-black/40" : "bg-primary/40")} /> {perk}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <span className={cn("text-2xl font-black tracking-tighter", isActive ? "text-black" : "text-white")}>₹{price.toLocaleString()}</span>
                <span className={cn("text-[8px] font-black uppercase block mt-1", isActive ? "text-black/40" : "text-secondary/30")}>Per Unit Vector</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-black/40 border border-teal-900/20 rounded-3xl">
        <div className="text-left mb-6 md:mb-0">
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2 underline decoration-primary underline-offset-4">Allocation Quantity</h4>
          <p className="text-[9px] text-secondary/40 font-black uppercase tracking-widest">Maximum 10 units per tactical operation</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => updateQuantity(quantity - 1)}
            className="w-12 h-12 rounded-full border border-teal-900/40 flex items-center justify-center text-xl font-black text-primary hover:bg-primary hover:text-black transition-all"
          >
            -
          </button>
          <span className="text-3xl font-black font-mono text-white min-w-12 text-center">{quantity}</span>
          <button 
            onClick={() => updateQuantity(quantity + 1)}
            className="w-12 h-12 rounded-full border border-teal-900/40 flex items-center justify-center text-xl font-black text-primary hover:bg-primary hover:text-black transition-all"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center p-6 bg-teal-900/5 border border-teal-900/10 rounded-2xl">
        <Info size={16} className="text-primary/60" />
        <p className="text-[9px] font-black uppercase text-secondary/40 tracking-[0.3em] leading-relaxed">
          Digital manifestation will be generated post-authorization. <br/>All sales are permanent once cryptographic seal is finalized.
        </p>
      </div>
    </div>
  );
}
