import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Wifi, Accessibility, Coffee, Tv, Info, Star } from 'lucide-react';
import { getTheater } from '../services/entertainmentService';
import { Theater } from '../types';
import UnifiedMap from '../components/UnifiedMap';

export default function TheaterDetails() {
  const { theaterId } = useParams();
  const navigate = useNavigate();
  const [theater, setTheater] = useState<Theater | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheater = async () => {
      if (theaterId) {
        setLoading(true);
        const data = await getTheater(theaterId);
        setTheater(data);
        setLoading(false);
      }
    };
    fetchTheater();
  }, [theaterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!theater) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black text-white uppercase mb-4">Theater Not Found</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-primary text-black font-bold uppercase tracking-widest rounded-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    'IMAX': <Tv size={20} />,
    '4DX': <Star size={20} />,
    'Recliner': <Accessibility size={20} />,
    'Dolby Atmos': <Tv size={20} />,
    'Cafe': <Coffee size={20} />,
    'Food Court': <Coffee size={20} />,
    'Parking': <MapPin size={20} />,
    'Wifi': <Wifi size={20} />
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-teal-900/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-secondary hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-xl border border-teal-900/30 flex items-center justify-center group-hover:bg-teal-900/20 group-hover:border-primary/30 transition-all">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-6 h-[1px] bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Theater Details</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-4 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase text-secondary tracking-widest px-2 py-1 border border-teal-900/30 rounded-sm">
                  {theater.city} Node
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
                {theater.name}
              </h1>
              <div className="flex items-start gap-3 p-6 bg-teal-900/5 border border-teal-900/20 rounded-sm">
                <MapPin className="text-primary mt-1 shrink-0" size={20} />
                <div>
                   <p className="text-secondary text-sm leading-relaxed uppercase tracking-tight font-medium">
                     {theater.address}
                   </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <Info size={16} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">System Amenities</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {theater.amenities?.map((amenity, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 bg-dark border border-teal-900/20 rounded-sm group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-sm bg-teal-940 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                        {amenityIcons[amenity] || <Star size={20} />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{amenity}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-900" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Map Side */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Geospatial Vectoring</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/40">
                  REF: {theater.id.substring(0, 8)}
                </span>
              </div>

              {theater.coordinates ? (
                <UnifiedMap 
                  center={theater.coordinates}
                  points={[{
                    id: theater.id,
                    title: theater.name,
                    lat: theater.coordinates.lat,
                    lng: theater.coordinates.lng,
                    description: theater.address
                  }]}
                />
              ) : (
                <div className="aspect-video bg-dark flex flex-col items-center justify-center rounded-sm border border-teal-900/30">
                  <MapPin className="text-secondary/20 mb-4" size={48} />
                  <p className="text-secondary/40 font-bold uppercase text-[10px] tracking-widest">Coordinates not mapped for this node</p>
                </div>
              )}

              <div className="mt-8 p-6 border border-teal-900/20 bg-teal-900/5 rounded-sm">
                <p className="text-[10px] text-secondary/60 leading-relaxed font-bold uppercase tracking-widest">
                  NOTE: Ensure the digital ticket is active upon arrival at the perimeter. Security nodes will synchronize with your hardware ID.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
