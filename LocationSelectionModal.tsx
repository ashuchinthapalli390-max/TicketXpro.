import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, Navigation as NavigationIcon, Globe, Search, ArrowRight, Building } from 'lucide-react';
import { cn } from '../lib/utils';

interface LocationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (city: string) => void;
}

const CITIES_GROUPS = [
  {
    title: 'Popular Cities',
    cities: [
      { name: 'Hyderabad', icon: 'https://images.unsplash.com/photo-1599933333333-333333333333?auto=format&fit=crop&q=80&w=200' },
      { name: 'Visakhapatnam', icon: 'https://images.unsplash.com/photo-1595856417531-f9250af7a8f3?auto=format&fit=crop&q=80&w=200' },
      { name: 'Narasaraopet', icon: 'https://images.unsplash.com/photo-1595856417531-f9250af7a8f3?auto=format&fit=crop&q=80&w=200' },
      { name: 'Vijayawada' },
      { name: 'Guntur' },
      { name: 'Warangal' },
      { name: 'Nellore' }
    ]
  },
  {
    title: 'Andhra Pradesh Districts',
    cities: [
      { name: 'Srikakulam' },
      { name: 'Vizianagaram' },
      { name: 'Palnadu' },
      { name: 'West Godavari' },
      { name: 'East Godavari' },
      { name: 'Prakasam' },
      { name: 'Ongole' },
      { name: 'Kadapa' },
      { name: 'Kurnool' },
      { name: 'Anantapur' },
      { name: 'Chittoor' },
      { name: 'Tirupati' }
    ]
  },
  {
    title: 'Telangana Districts',
    cities: [
      { name: 'Khammam' },
      { name: 'Nizamabad' },
      { name: 'Mahabubnagar' },
      { name: 'Nalgonda' },
      { name: 'Adilabad' },
      { name: 'Sircilla' }
    ]
  }
];

export default function LocationSelectionModal({ isOpen, onClose, currentCity, onSelectCity }: LocationSelectionModalProps) {
  const [search, setSearch] = React.useState('');

  const filteredCities = CITIES_GROUPS.map(group => ({
    ...group,
    cities: group.cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.cities.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-dark border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <MapPin size={24} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">Select Area</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2">Currently showing in <span className="text-primary italic animate-pulse">{currentCity}</span></p>
                  </div>
               </div>
               
               <div className="relative flex-1 max-w-xs hidden sm:block">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-gray-900 dark:text-white"
                  />
               </div>

               <button onClick={onClose} className="p-3 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 group transition-all flex items-center gap-2">
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
               </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
               {/* Detect Location Button */}
               <button className="w-full p-6 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-3xl mb-10 transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <NavigationIcon size={20} />
                     </div>
                     <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Autodetect Navigation</p>
                        <p className="text-[9px] font-bold uppercase text-primary/60 tracking-widest mt-1">High-Precision GPS Synchronization</p>
                     </div>
                  </div>
                  <ArrowRight className="text-primary opacity-40 group-hover:opacity-100 transition-all" />
               </button>

               <div className="space-y-12">
                  {filteredCities.map((group) => (
                    <div key={group.title}>
                       <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.4em] mb-6 flex items-center gap-3">
                          <span className="w-8 h-[1px] bg-gray-100 dark:bg-gray-800" />
                          {group.title}
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {group.cities.map((city: any) => (
                            <button
                              key={city.name}
                              onClick={() => { onSelectCity(city.name); onClose(); }}
                              className={cn(
                                "group relative p-4 rounded-3xl border transition-all flex flex-col items-center gap-3",
                                currentCity === city.name 
                                  ? "bg-primary border-primary shadow-xl shadow-primary/20" 
                                  : "bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-primary/50"
                              )}
                            >
                               {city.icon ? (
                                 <div className="w-16 h-16 rounded-2xl overflow-hidden mb-1 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    <img src={city.icon} alt={city.name} className="w-full h-full object-cover" />
                                 </div>
                               ) : (
                                 <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all">
                                    <Building size={24} />
                                 </div>
                               )}
                               <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest",
                                 currentCity === city.name ? "text-white" : "text-gray-600 dark:text-gray-400"
                               )}>{city.name}</span>
                               
                               {currentCity === city.name && (
                                 <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <Check className="text-primary" size={10} strokeWidth={4} />
                                 </div>
                               )}
                            </button>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-center">
               <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">
                  Not seeing your area? Use the manual search portal or contact regional logistics.
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helper icons missing in imports
function Check({ className, size, strokeWidth }: { className?: string, size?: number, strokeWidth?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth || 2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
