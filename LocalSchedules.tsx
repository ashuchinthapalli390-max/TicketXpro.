import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Ticket, Clock, ChevronRight, Film, Calendar } from 'lucide-react';
import { getSchedulesByCity } from '../services/entertainmentService';
import { Theater, MovieDetail, Schedule } from '../types';
import { useNavigate } from 'react-router-dom';

interface LocalSchedulesProps {
  city: string;
  selectedTheater?: string;
  onBook?: (movie: MovieDetail, schedule: Schedule) => void;
}

export const LocalSchedules: React.FC<LocalSchedulesProps> = ({ city, selectedTheater, onBook }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    theaters: Theater[];
    movies: MovieDetail[];
    schedules: Schedule[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getSchedulesByCity(city);
      setData(result);
      setLoading(false);
    };
    load();
  }, [city]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Organizing Schedules for {city}...</p>
      </div>
    );
  }

  if (!data || data.theaters.length === 0) return null;

  // Grouping logic: Theater -> Movie -> Showtimes
  const groupedData = data.theaters
    .filter(t => !selectedTheater || selectedTheater === 'All Theaters' || t.name === selectedTheater)
    .map(theater => {
    const theaterSchedules = data.schedules.filter(s => s.theaterId === theater.id);
    const movieIdsInTheater = [...new Set(theaterSchedules.map(s => s.movieId))];
    
    const moviesWithShows = movieIdsInTheater.map(mId => {
      const movie = data.movies.find(m => m.id === mId);
      const shows = theaterSchedules.filter(s => s.movieId === mId);
      return { movie, shows };
    }).filter(item => item.movie);

    return { theater, movies: moviesWithShows };
  }).filter(t => t.movies.length > 0);

  if (groupedData.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-[2px] bg-primary" />
              <span className="text-xs font-black uppercase text-primary tracking-widest">Cinema Hub</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
              Local <span className="text-primary">Showtimes</span>
            </h2>
            <div className="flex items-center gap-2 mt-4 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
              <Calendar size={14} className="text-primary" />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <span className="text-primary">Live Now</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
            View All Theaters <ChevronRight size={16} />
          </button>
        </div>

        <div className="space-y-12">
          {groupedData.map((group, idx) => (
            <motion.div 
              key={group.theater.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{group.theater.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                        {group.theater.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.theater.amenities?.map(amenity => (
                      <span key={amenity} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 rounded-full">{amenity}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {group.movies.map(({ movie, shows }) => (
                    <div key={movie?.id} className="flex gap-6 group">
                      <div 
                        className="w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 shadow-md group-hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => navigate(`/movie/${movie?.id}`)}
                      >
                        <img src={movie?.imageUrl} alt={movie?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h4 
                            className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none hover:text-primary transition-colors cursor-pointer"
                            onClick={() => navigate(`/movie/${movie?.id}`)}
                          >
                            {movie?.title}
                          </h4>
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded text-[10px] font-bold">
                            <Film size={12} /> {movie?.language}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 line-clamp-1">{movie?.genre.join(' • ')}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {shows.map(show => (
                            <button
                              key={show.id}
                              onClick={() => {
                                if (onBook && movie) {
                                  onBook(movie, show);
                                } else {
                                  navigate(`/movie/${movie?.id}?schedule=${show.id}`);
                                }
                              }}
                              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-primary hover:text-white transition-all rounded-lg border border-gray-100 dark:border-gray-700 text-xs font-black uppercase tracking-tight flex flex-col items-center"
                            >
                              <span className="text-[10px] opacity-60 flex items-center gap-1 mb-0.5"><Clock size={10} /> {show.format}</span>
                              {show.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
