import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, MapPin, Clock, Star, Info, ChevronRight, Search, Filter, Building } from 'lucide-react';
import { getMovieDetail, getTheatersByCity, getSchedules } from '../services/entertainmentService';
import { MovieDetail, Theater, Schedule } from '../types';

import { useLocationContext } from '../hooks/useLocation';

export const TheaterSelection: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { city } = useLocationContext();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('TODAY');
  const [schedulesMap, setSchedulesMap] = useState<Record<string, Schedule[]>>({});

  const dates = [
    { label: 'TODAY', day: '08', month: 'MAY' },
    { label: 'TOM', day: '09', month: 'MAY' },
    { label: 'SAT', day: '10', month: 'MAY' },
    { label: 'SUN', day: '11', month: 'MAY' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) return;
      const movieData = await getMovieDetail(movieId);
      setMovie(movieData);

      const theaterData = await getTheatersByCity(city);
      setTheaters(theaterData);

      // Fetch schedules for all theaters in this city
      const map: Record<string, Schedule[]> = {};
      for (const t of theaterData) {
        const scheds = await getSchedules(movieId, t.id);
        map[t.id] = scheds;
      }
      setSchedulesMap(map);
      
      setLoading(false);
    };
    fetchData();
  }, [movieId, city]);

  if (loading) return (
    <div className="min-h-screen pt-24 bg-white dark:bg-dark flex items-center justify-center transition-colors">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white transition-colors">
      {/* Header Info */}
      <div className="pt-24 pb-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark sticky top-0 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6 uppercase text-[10px] font-black tracking-widest transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Movie
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">{movie?.title}</h1>
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1 font-black text-gray-900 dark:text-white"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {movie?.rating}</span>
                <span>•</span>
                <span>{movie?.genre.join(' • ')}</span>
                <span>•</span>
                <span className="font-black text-primary">UA | {movie?.duration}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {dates.map((date) => (
                <button
                  key={date.label}
                  onClick={() => setSelectedDate(date.label)}
                  className={`flex flex-col items-center justify-center min-w-[80px] py-3 rounded-2xl border transition-all ${
                    selectedDate === date.label 
                      ? 'bg-primary border-primary text-white font-black shadow-xl shadow-primary/20' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary'
                  }`}
                >
                  <span className="text-[8px] uppercase font-black tracking-widest leading-none mb-1">{date.label}</span>
                  <span className="text-2xl font-black">{date.day}</span>
                  <span className="text-[8px] uppercase font-black tracking-[0.2em] opacity-60 leading-none">{date.month}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-primary" /> Cinema near <span className="text-primary italic">{city}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {theaters.map((theater) => (
                <motion.div
                  key={theater.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                          <Building className="w-7 h-7 text-primary" />
                        </div>
                        <div 
                          className="cursor-pointer group/info"
                          onClick={() => navigate(`/theater/${theater.id}`)}
                        >
                          <h3 className="text-2xl font-black group-hover/info:text-primary transition-colors flex items-center gap-3 text-gray-900 dark:text-white">
                            {theater.name}
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover/info:opacity-100 transition-all">
                               <ChevronRight size={14} className="text-primary" />
                            </div>
                          </h3>
                          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2 group-hover/info:text-gray-600 transition-colors">
                            <MapPin size={12} />
                            {theater.address}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {theater.amenities.map(a => (
                          <span key={a} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{a}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {schedulesMap[theater.id]?.map((schedule) => (
                        <motion.button
                          key={schedule.id}
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/checkout/seats/${schedule.id}`)}
                          className="group/btn relative py-4 px-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary hover:bg-primary/5 transition-all text-center min-w-[120px] shadow-sm hover:shadow-xl"
                        >
                          <div className="text-primary font-black text-xl tracking-tighter">{schedule.time}</div>
                          <div className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1 tracking-[0.2em]">{schedule.format}</div>
                          
                          <div className="absolute inset-x-0 -bottom-1 h-1 bg-primary scale-x-0 group-hover/btn:scale-x-50 transition-transform rounded-full opacity-50" />
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Fully Refundable
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> Fast Filling
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-8 rounded-3xl bg-orange-50 dark:bg-primary/10 border border-orange-100 dark:border-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12" />
              <h3 className="text-primary font-black mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
                <Info size={14} /> Seasonal Protocol
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Enjoy 50% discount on F&B with <span className="text-gray-900 dark:text-white font-black tracking-widest">FREESHIP</span> protocol.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">Show Info</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                   <Clock className="text-primary mt-1" size={18} />
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Reschedule</p>
                     <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2 leading-relaxed">Available up to 2 hours before showtime synchronization.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
