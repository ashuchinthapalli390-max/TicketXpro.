import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Calendar, Clock, Star, Users, MapPin, ChevronRight, Share2, Heart, X, Globe, Info, Building } from 'lucide-react';
import { getMovieDetail, getTheatersByCity, getSchedulesByMovieAndCity } from '../services/entertainmentService';
import { MovieDetail, Theater } from '../types';
import { cn } from '../lib/utils';

import { useLocationContext } from '../hooks/useLocation';

interface MovieSchedule {
  theaterId: string;
  theaterName: string;
  timings: { id: string; time: string }[];
}

export const MovieDetails: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { city } = useLocationContext();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyTheaters, setNearbyTheaters] = useState<Theater[]>([]);
  const [schedules, setSchedules] = useState<MovieSchedule[]>([]);

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      setLoading(true);
      const [movieData, theaters, scheduleData] = await Promise.all([
        getMovieDetail(movieId),
        getTheatersByCity(city),
        getSchedulesByMovieAndCity(movieId, city)
      ]);
      
      setMovie(movieData);
      setNearbyTheaters(theaters);
      setSchedules(scheduleData);
      
      setLoading(false);
    };
    fetchMovie();
  }, [movieId, city]);

  if (loading) return (
    <div className="min-h-screen pt-24 bg-white dark:bg-dark flex items-center justify-center transition-colors">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen pt-24 bg-white dark:bg-dark text-gray-900 dark:text-white text-center transition-colors">
      Movie not found.
    </div>
  );

  const formattedDate = movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Scheduled';

  const isUpcoming = movie.releaseDate ? new Date(movie.releaseDate) > new Date() : false;
  const isPreBookingAvailable = () => {
    if (!movie.releaseDate) return false;
    const today = new Date();
    const relDate = new Date(movie.releaseDate);
    const diffTime = relDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 5;
  };

  const preBookingOpen = isPreBookingAvailable();

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2026';

  return (
    <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-white pb-20 transition-colors">
      {/* Floating Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-[60] flex items-center gap-3 p-3 px-6 bg-white/10 hover:bg-primary backdrop-blur-md rounded-2xl text-white border border-white/10 transition-all group shadow-2xl"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
      </button>

      <AnimatePresence>
        {isTrailerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsTrailerOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X size={20} />
              </button>
              <iframe
                src={`${movie.trailerUrl.replace('watch?v=', 'embed/').replace('shorts/', 'embed/')}?autoplay=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark via-transparent to-black/40 z-10" />
        <img 
          src={movie.backdropUrl || movie.imageUrl} 
          alt={movie.title}
          className="w-full h-full object-cover opacity-50 blur-[2px]"
        />
        
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsTrailerOpen(true)}
            className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center backdrop-blur-md group"
          >
            <Play className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Poster */}
          <div className="lg:col-span-4 col-span-12 flex justify-center lg:block">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] aspect-[2/3] w-full max-w-[400px] bg-gray-800"
            >
              <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          {/* Details Content */}
          <div className="lg:col-span-8 col-span-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {isUpcoming ? (
                  <span className={cn(
                    "px-4 py-1.5 border rounded-full text-xs font-black uppercase tracking-[0.1em]",
                    preBookingOpen ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700"
                  )}>
                    {preBookingOpen ? "Pre-Booking Open" : "Upcoming Release"}
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-[0.1em]">Now Showing</span>
                )}
                {movie.genre.map(g => (
                  <span key={g} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-wider">{g}</span>
                ))}
              </div>

              <h1 className="text-4xl lg:text-7xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-none">
                {movie.title} <span className="text-gray-400 dark:text-gray-600 ml-2 font-medium opacity-50">({releaseYear})</span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-12 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-900 dark:text-white font-black text-lg">{movie.rating}</span>
                </div>
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{movie.duration}</span>
                </div>
                {movie.language && (
                  <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>{movie.language}</span>
                  </div>
                )}
                {movie.releaseDate && (
                  <>
                    <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                       <span className="text-[8px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">YEAR</span>
                       <span>{releaseYear}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                  <Info className="w-4 h-4 text-primary" />
                  <span>2D, 3D, IMAX</span>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Synopsis</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                    {movie.synopsis}
                  </p>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                       The Cast
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                      {movie.cast.join(' • ')}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Direction</h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">{movie.director}</div>
                  </section>
                </div>

                {schedules.length > 0 && (
                  <section className="bg-gray-50 dark:bg-gray-900/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Active Transmissions</h3>
                         <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                            <Calendar size={10} className="text-primary" />
                            <span>May 09, 2026</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-green-500">Live Showtimes</span>
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{city} Sector</span>
                    </div>
                    <div className="space-y-4">
                      {schedules.map(s => (
                        <div 
                          key={s.theaterId}
                          className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl group hover:border-primary/50 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div 
                              className="flex items-center gap-4 cursor-pointer"
                              onClick={() => navigate(`/theater/${s.theaterId}`)}
                            >
                              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary transition-all">
                                <Building size={20} className="text-primary group-hover:text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">{s.theaterName}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Operational</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {s.timings.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => navigate(`/checkout/seats/${t.id}`)}
                                  className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-xs font-black text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-widest"
                                >
                                  {t.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div className="pt-12 border-t border-gray-100 dark:border-gray-800 mt-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center md:text-left">
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-2">Gate Access from</div>
                      <div className="text-4xl font-black text-gray-900 dark:text-white">₹{movie.price || 250}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsTrailerOpen(true)}
                        className="px-8 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 hover:border-primary transition-all uppercase text-[10px] tracking-[0.2em]"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Watch Trailer
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/checkout/theaters/${movieId}`)}
                        className="px-12 py-5 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.2em]"
                      >
                        {preBookingOpen ? "Pre-Book Now" : isUpcoming ? "Coming Soon" : "Book Expedition"}
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
