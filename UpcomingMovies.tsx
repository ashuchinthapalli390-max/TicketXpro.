import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Ticket, ChevronRight, Zap, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MovieDetail } from '../types';

interface UpcomingMoviesProps {
  city: string;
}

export const UpcomingMovies: React.FC<UpcomingMoviesProps> = ({ city }) => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<MovieDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0]; 
      
      const q = query(
        collection(db, 'movie_details'),
        where('releaseDate', '>', today),
        limit(10)
      );

      const snap = await getDocs(q);
      const movies = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MovieDetail));
      setUpcoming(movies);
      setLoading(false);
    };

    fetchUpcoming();
  }, [city]);

  if (loading) return null;
  if (upcoming.length === 0) return null;

  const isPreBookingAvailable = (releaseDate: string) => {
    const today = new Date(); 
    const relDate = new Date(releaseDate);
    const diffTime = relDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 5;
  };

  return (
    <section className="py-24 bg-gray-50/50 dark:bg-gray-900/10 transition-colors overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4 text-primary font-bold uppercase text-[10px] tracking-[0.2em]">
               <Zap size={14} />
               <span>Future Releases</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
              Upcoming <span className="text-primary italic">Attractions</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Anticipated hits heading to theaters in {city}.</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
            Full Schedule <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcoming.map((movie, index) => {
            const preBooking = isPreBookingAvailable(movie.releaseDate);
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={movie.imageUrl} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {preBooking && (
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest ring-4 ring-primary/20 animate-pulse">
                        <Ticket size={12} />
                        Pre-Booking Open
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
                      <Calendar size={12} />
                      {new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{movie.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                    {movie.synopsis}
                  </p>
                  
                  <div className="flex items-center justify-between gap-4">
                    <button 
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Info size={14} /> Details
                    </button>
                    
                    {preBooking && (
                      <button 
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        Book Now <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
