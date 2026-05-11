import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Train, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BookingNode } from '../../services/entertainmentService';

interface TrainCoachLayoutProps {
  node: BookingNode;
  onSeatSelect: (seats: string[]) => void;
}

interface Passenger {
  id: number;
  name: string;
  age: string;
  gender: string;
  berthPreference: string;
}

export default function TrainCoachLayout({ node, onSeatSelect }: TrainCoachLayoutProps) {
  const [activeClass, setActiveClass] = useState('3AC');
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, name: '', age: '', gender: 'Male', berthPreference: 'Lower' }
  ]);
  const [autoUpgrade, setAutoUpgrade] = useState(false);

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers([...passengers, { id: passengers.length + 1, name: '', age: '', gender: 'Male', berthPreference: 'Lower' }]);
    onSeatSelect(passengers.map((_, i) => `P${i + 1}`));
  };

  const updatePassenger = (id: number, field: keyof Passenger, value: string) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePassenger = (id: number) => {
    if (passengers.length === 1) return;
    const next = passengers.filter(p => p.id !== id);
    setPassengers(next);
    onSeatSelect(next.map((_, i) => `P${i + 1}`));
  };

  return (
    <div className="space-y-10">
      {/* Coach Tab Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar bg-black/40 p-2 rounded-xl border border-teal-900/10">
        {['SL', '3AC', '2AC', '1AC', 'CC'].map(cls => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={cn(
              "px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeClass === cls ? "bg-primary text-black" : "text-secondary/40 hover:text-white hover:bg-white/5"
            )}
          >
            {cls} Class
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 p-6 bg-teal-900/5 border border-teal-900/20 rounded-2xl">
        <Train className="text-primary" size={24} />
        <div className="text-left">
           <h4 className="text-xs font-black uppercase tracking-widest text-white">{node.metadata?.trainName || 'VECTOR EXPRESS'}</h4>
           <p className="text-[8px] text-secondary/40 font-black uppercase tracking-widest">Running Daily • {node.metadata?.trainNo || 'TX_9901'}</p>
        </div>
        <div className="flex-1" />
        <div className="text-right">
           <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded">₹{node.price}/Seat</span>
        </div>
      </div>

      {/* Passenger Entry Form */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white text-left px-2">Manifest Entry Protocols</h3>
        
        <div className="space-y-4">
          {passengers.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-dark/60 border border-teal-900/30 rounded-2xl relative group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Passenger #{idx + 1}</span>
                </div>
                {passengers.length > 1 && (
                  <button onClick={() => removePassenger(p.id)} className="text-[8px] font-black uppercase text-red-500 hover:text-red-400 transition-colors">Discard</button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    placeholder="FULL LEGAL NAME" 
                    value={p.name}
                    onChange={(e) => updatePassenger(p.id, 'name', e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-teal-900/10 rounded-sm py-4 px-6 text-xs text-white outline-none focus:border-primary transition-all font-black placeholder:text-secondary/20"
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    placeholder="AGE" 
                    value={p.age}
                    onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                    className="w-full bg-black/40 border border-teal-900/10 rounded-sm py-4 px-6 text-xs text-white outline-none focus:border-primary transition-all font-black"
                  />
                </div>
                <div>
                  <select 
                    value={p.gender}
                    onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                    className="w-full bg-black/40 border border-teal-900/10 rounded-sm py-4 px-6 text-xs text-white outline-none focus:border-primary transition-all font-black appearance-none cursor-pointer"
                  >
                    <option>MALE</option>
                    <option>FEMALE</option>
                    <option>THIRD_GEN</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <div className="relative">
                    <select 
                      value={p.berthPreference}
                      onChange={(e) => updatePassenger(p.id, 'berthPreference', e.target.value)}
                      className="w-full bg-teal-900/5 border border-teal-900/10 rounded-sm py-4 pl-6 pr-10 text-[10px] font-black uppercase tracking-widest text-primary outline-none appearance-none cursor-pointer"
                    >
                      <option>NULL PREFERENCE</option>
                      <option>LOWER BERTH</option>
                      <option>MIDDLE BERTH</option>
                      <option>UPPER BERTH</option>
                      <option>SIDE LOWER</option>
                      <option>SIDE UPPER</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={14} />
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-black text-secondary/40 uppercase tracking-widest px-4">
                    <CheckCircle2 size={12} className="text-green-500" /> Identity Verified via System ID
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={addPassenger}
          className="w-full py-4 border-2 border-dashed border-teal-900/20 hover:border-primary/40 hover:bg-primary/5 text-secondary/40 hover:text-primary text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-2xl"
        >
          + Add New Passenger Unit
        </button>
      </div>

      <div className="flex items-center justify-between p-6 bg-black/40 border border-teal-900/20 rounded-2xl">
        <label className="flex items-center gap-4 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-5 h-5 bg-black border-2 border-teal-900/30 rounded checked:bg-primary transition-all cursor-pointer"
            checked={autoUpgrade}
            onChange={(e) => setAutoUpgrade(e.target.checked)}
          />
          <div className="text-left">
            <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">Opt for IRCTC Auto-Upgradation</span>
            <p className="text-[8px] text-secondary/40 font-black uppercase tracking-widest">Probability of higher class assignment based on vacancy</p>
          </div>
        </label>
      </div>
    </div>
  );
}
