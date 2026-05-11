import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Info, Cpu, ShieldCheck, Ticket } from 'lucide-react';
import { Schedule, MovieDetail } from '../types';
import MovieSeatMap from '../components/booking/MovieSeatMap';
import { useAuth } from '../hooks/useAuth';
import UniversalBookingPanel from '../components/UniversalBookingPanel';
import { getMovieDetail, getScheduleDetail } from '../services/entertainmentService';

export const SeatSelectionPage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!scheduleId) return;
      
      const schedData = await getScheduleDetail(scheduleId);
      if (schedData) {
        setSchedule(schedData);
        
        // If movieId is 'pending' (from fallback), we might need more info but usually theatreSelection would have passed it.
        // For now, let's try to get details if we have an ID
        if (schedData.movieId && schedData.movieId !== 'pending') {
          const movieData = await getMovieDetail(schedData.movieId);
          setMovie(movieData);
        } else {
           // If we don't have a specific movie ID, find the first movie from SAMPLE_DATA as a representative
           const firstMovie = await getMovieDetail('local_0');
           setMovie(firstMovie);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [scheduleId]);

  if (loading) return (
    <div className="min-h-screen pt-24 bg-white dark:bg-dark flex items-center justify-center transition-colors">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!schedule || !movie) return (
    <div className="min-h-screen pt-24 bg-white dark:bg-dark text-gray-900 dark:text-white text-center transition-colors">
      Schedule not found.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white pt-24 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 p-3 px-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary transition-all text-gray-600 dark:text-gray-400 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back to Selection</span>
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">{movie.title}</h1>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                <span className="text-primary">{schedule.time}</span>
                <span className="opacity-30">|</span>
                <span>{schedule.format}</span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1.5"><Ticket size={14} className="text-primary" /> Cinema Control Unit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-250px)] relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-colors">
            <UniversalBookingPanel 
              node={{
                id: schedule.id,
                title: movie.title,
                category: 'movie',
                price: schedule.price,
                imageUrl: movie.imageUrl,
                venue: 'Premium Bioscope',
                district: 'Regional Hub',
                dateTime: schedule.time, // Pass actual time
                metadata: { ...movie, ...schedule }
              }}
              onCancel={() => navigate(-1)}
              onComplete={(details) => console.log("Booking finalized:", details)}
              isFullPage={true}
            />
        </div>
      </div>
    </div>
  );
};
