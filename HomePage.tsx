import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Film, 
  Train, 
  Building, 
  PartyPopper, 
  Search,
  Star,
  MapPin,
  Calendar,
  Ticket,
  ChevronRight,
  Zap,
  Flame,
  ArrowUpRight,
  CheckCircle,
  Bus,
  Plane,
  Clock,
  ArrowRight,
  Navigation as NavigationIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchBookingNodes, BookingNode, BookingCategory, getTheatersByCity } from '../services/entertainmentService';
import { cn } from '../lib/utils';
import AboutSection from '../components/AboutSection';
import { Theater, MovieDetail, Schedule } from '../types';

import { useLocationContext } from '../hooks/useLocation';
import UniversalBookingPanel from '../components/UniversalBookingPanel';
import LocationSelectionModal from '../components/LocationSelectionModal';
import { LocalSchedules } from '../components/LocalSchedules';
import { UpcomingMovies } from '../components/UpcomingMovies';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { city, setCity } = useLocationContext();
  const [nodes, setNodes] = useState<BookingNode[]>([]);
  const [visibleNodes, setVisibleNodes] = useState<BookingNode[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [activeCategory, setActiveCategory] = useState<string>('Movies');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<BookingNode | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedTheater, setSelectedTheater] = useState<string>('All Theaters');
  const [isTheaterDropdownOpen, setIsTheaterDropdownOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const cities = [
    'Narasaraopet', 'Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 
    'Warangal', 'Nellore', 'Tirupati', 'East Godavari', 'Kurnool', 
    'Kadapa', 'Ongole', 'Srikakulam', 'Anantapur', 'Nalgonda', 'Mahabubnagar'
  ];

  const genres = [
    'All Genres', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Heist', 'Neo-noir', 'Animation', 'Thriller'
  ];

  const languages = [
    'All Languages', 'Telugu', 'English', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'
  ];

  useEffect(() => {
    setSelectedTheater('All Theaters');
    setSelectedGenres([]);
    setSelectedLanguages([]);
  }, [activeCategory]);

  useEffect(() => {
    loadData(activeCategory, searchQuery, city, selectedTheater, selectedGenres, selectedLanguages);
  }, [activeCategory, searchQuery, city, selectedTheater, selectedGenres, selectedLanguages]);

  useEffect(() => {
    const fetchTheaters = async () => {
      const cityTheaters = await getTheatersByCity(city);
      setTheaters(cityTheaters);
      setSelectedTheater('All Theaters'); // Reset theater when city changes
    };
    fetchTheaters();
  }, [city]);

  const loadData = async (category: string, query?: string, district?: string, venue?: string, selectedGenres?: string[], selectedLanguages?: string[]) => {
    setLoading(true);
    const catMap: Record<string, BookingCategory> = {
      'Movies': 'movie',
      'Trains': 'train',
      'Bus': 'bus',
      'Flight': 'flight',
      'Events': 'event',
      'Hotels': 'hotel'
    };
    
    const searchCat = catMap[category === 'Upcoming' ? 'Movies' : category];
    let results = await searchBookingNodes({ 
      searchTerm: query, 
      category: searchCat,
      district: district
    });

    if (category === 'Upcoming') {
      const today = new Date();
      results = results.filter(n => {
        const relDateStr = n.metadata?.releaseDate;
        if (!relDateStr) return false;
        const relDate = new Date(relDateStr);
        return relDate > today;
      });
    }

    if (venue && venue !== 'All Theaters') {
      results = results.filter(n => n.venue === venue);
    }

    if (selectedGenres && selectedGenres.length > 0) {
      results = results.filter(n => selectedGenres.some(g => n.tags?.includes(g)));
    }

    if (selectedLanguages && selectedLanguages.length > 0) {
      results = results.filter(n => {
        const movieLang = n.metadata?.language?.toLowerCase();
        const movieTags = n.tags?.map(t => t.toLowerCase()) || [];
        return selectedLanguages.some(l => {
          const lowerL = l.toLowerCase();
          return lowerL === movieLang || movieTags.includes(lowerL);
        });
      });
    }

    setNodes(results);
    setVisibleNodes(results.slice(0, PAGE_SIZE));
    setPage(1);
    setLoading(false);
  };

  const loadMore = () => {
    const nextLimit = (page + 1) * PAGE_SIZE;
    setVisibleNodes(nodes.slice(0, nextLimit));
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleNodes.length < nodes.length && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById('infinite-scroll-trigger');
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [visibleNodes.length, nodes.length, loading]);

  const handleMovieBooking = (movie: MovieDetail | BookingNode, schedule?: Schedule) => {
    const bookingNode: BookingNode = {
      id: schedule?.id || movie.id,
      title: movie.title,
      description: (movie as MovieDetail).synopsis || (movie as BookingNode).description,
      category: 'movie',
      district: city,
      dateTime: schedule?.time || (movie as BookingNode).dateTime || new Date().toISOString(),
      venue: schedule ? theaters.find(t => t.id === schedule.theaterId)?.name || 'Local Theater' : (movie as BookingNode).venue || 'Main Cinema',
      imageUrl: movie.imageUrl,
      price: schedule?.price || (movie as BookingNode).price || 150,
      metadata: {
        movieId: movie.id,
        scheduleId: schedule?.id,
        format: schedule?.format || '2D'
      }
    };
    setSelectedNode(bookingNode);
  };

  const categories = [
    { id: 'Movies', label: 'Movies', icon: Film, color: 'text-primary' },
    { id: 'Upcoming', label: 'Upcoming', icon: Calendar, color: 'text-orange-500' },
    { id: 'Trains', label: 'Trains', icon: Train, color: 'text-blue-600' },
    { id: 'Bus', label: 'Bus', icon: Bus, color: 'text-green-600' },
    { id: 'Flight', label: 'Flight', icon: Plane, color: 'text-sky-500' },
    { id: 'Events', label: 'Events', icon: PartyPopper, color: 'text-pink-600' },
    { id: 'Hotels', label: 'Hotels', icon: Building, color: 'text-amber-600' }
  ];

  return (
    <div className="pt-20 bg-white dark:bg-dark transition-colors">
      {/* Location Bar - Sticky on Top after Hero */}
      <div className="sticky top-20 z-[90] bg-white/80 dark:bg-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 py-3 shadow-sm transition-all overflow-hidden">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 relative">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <MapPin className="text-primary" size={18} />
             </div>
             <div 
               className="cursor-pointer group"
               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             >
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Scanning Region</p>
                <div className="flex items-center gap-2">
                   <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">{city}</h2>
                   <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                   <ChevronRight className={cn("text-gray-300 w-3 h-3 transition-transform", isDropdownOpen ? "rotate-90" : "rotate-0")} />
                </div>
             </div>

             <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                    >
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {cities.sort().map(cityName => (
                          <button
                            key={cityName}
                            onClick={() => {
                              setCity(cityName);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors",
                              city === cityName 
                                ? "bg-primary text-white" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                            )}
                          >
                            {cityName}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
             </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={() => setIsLocationModalOpen(true)}
               className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-800 transition-all flex items-center gap-2"
             >
                <Globe size={12} /> Change City
             </button>
             <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:flex px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20 transition-all items-center gap-2"
             >
                <NavigationIcon size={12} /> Near Me
             </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/20 mt-16 transition-colors">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white transition-colors">
              Entertainment <br /><span className="text-primary italic">Simplified.</span>
            </h1>
            <div className="relative w-full max-w-2xl mx-auto mb-10 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={24} />
              <input 
                type="text"
                placeholder={`Search for movies, theaters, or events in ${city}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-20 py-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-gray-100 dark:border-gray-800 rounded-3xl text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl shadow-black/5 text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative w-fit mx-auto mb-8">
              <div className="flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-all group"
                   onClick={() => setIsHeroDropdownOpen(!isHeroDropdownOpen)}>
                <MapPin className="text-primary group-hover:scale-110 transition-transform" size={20} />
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase text-gray-400 group-hover:text-primary transition-colors tracking-widest leading-none mb-1">Active Region</p>
                   <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{city}</h2>
                </div>
                <ChevronRight className={cn("text-gray-300 ml-4 group-hover:translate-x-1 transition-transform", isHeroDropdownOpen ? "rotate-90" : "rotate-0")} size={16} />
              </div>

              <AnimatePresence>
                {isHeroDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsHeroDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                    >
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {cities.sort().map(cityName => (
                          <button
                            key={cityName}
                            onClick={() => {
                              setCity(cityName);
                              setIsHeroDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group",
                              city === cityName 
                                ? "bg-primary text-white" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                            )}
                          >
                            {cityName}
                            {city === cityName && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg mb-10 font-medium transition-colors">
              Your gateway to movies, experiences, and more. <br />Seamless booking for the modern explorer.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth'})}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-primary/20"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Local Live Schedules Section */}
      <LocalSchedules city={city} selectedTheater={selectedTheater} onBook={handleMovieBooking} />

      {/* Upcoming Movies Section */}
      <UpcomingMovies city={city} />

      {/* Discovery Hub */}
      <section id="discovery" className="container mx-auto px-4 py-20">
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold uppercase mb-2">Discovery Hub</h2>
            <p className="text-gray-500 font-medium">Quick access to premium services in {city}.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all space-y-3 group",
                    isActive 
                      ? "bg-primary border-primary shadow-xl shadow-primary/20 text-white" 
                      : "bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-4 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <h3 className="text-xl font-bold uppercase mb-1 text-gray-900 dark:text-white">
              {activeCategory === 'Movies' ? 'Now Showing' : 
               activeCategory === 'Upcoming' ? 'Pre-Booking Open' :
               activeCategory === 'Trains' ? 'Available Routes' :
               activeCategory === 'Events' ? 'Upcoming Events' : `Verified ${activeCategory}`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-widest">Showing results based on your current location.</p>
          </div>
          
          <div className="flex flex-col gap-6">
             <div className="flex flex-wrap items-center gap-3">
               {(activeCategory === 'Movies' || activeCategory === 'Upcoming') && (
                 <>
                   <div className="relative group">
                      <div 
                        onClick={() => setIsTheaterDropdownOpen(!isTheaterDropdownOpen)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all border",
                          selectedTheater !== 'All Theaters' 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary"
                        )}
                      >
                         <Building size={14} className={selectedTheater !== 'All Theaters' ? "text-white" : "text-primary"} />
                         <span className="text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate">
                           {selectedTheater === 'All Theaters' ? 'Select Theater' : selectedTheater}
                         </span>
                         <ChevronRight size={12} className={cn("transition-transform", isTheaterDropdownOpen ? "rotate-90" : "rotate-0", selectedTheater !== 'All Theaters' ? "text-white/70" : "text-gray-400")} />
                      </div>
                      
                      <AnimatePresence>
                        {isTheaterDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setIsTheaterDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-3xl z-[110] py-3 overflow-hidden"
                            >
                              <div className="px-5 py-2 border-b border-gray-50 dark:border-gray-800 mb-2">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Cinema Halls: {city}</p>
                              </div>
                              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                <button
                                  onClick={() => {
                                    setSelectedTheater('All Theaters');
                                    setIsTheaterDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                    selectedTheater === 'All Theaters' 
                                      ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  )}
                                >
                                  <span>All Theaters</span>
                                  {selectedTheater === 'All Theaters' && <CheckCircle size={12} className="text-primary" />}
                                </button>
                                {theaters.length === 0 ? (
                                  <div className="px-5 py-4 text-[10px] text-gray-400 italic">No theaters mapped in this region.</div>
                                ) : (
                                  theaters.map(theater => (
                                    <button
                                      key={theater.id}
                                      onClick={() => {
                                        setSelectedTheater(theater.name);
                                        setIsTheaterDropdownOpen(false);
                                      }}
                                      className={cn(
                                        "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                        selectedTheater === theater.name 
                                          ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                      )}
                                    >
                                      <span className="truncate pr-6">{theater.name}</span>
                                      {selectedTheater === theater.name && <CheckCircle size={12} className="text-primary" />}
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                   </div>
    
                  <div className="flex items-center gap-3 relative">
                     <Flame className="text-primary" size={14} />
                     <div 
                       onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                       className={cn(
                         "flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all border",
                         selectedGenres.length > 0 
                           ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                           : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary"
                       )}
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate">
                          {selectedGenres.length === 0 ? 'Select Genre' : selectedGenres.join(', ')}
                        </span>
                        <ChevronRight size={12} className={cn("transition-transform", isGenreDropdownOpen ? "rotate-90" : "rotate-0", selectedGenres.length > 0 ? "text-white/70" : "text-gray-400")} />
                     </div>
                     
                     <AnimatePresence>
                       {isGenreDropdownOpen && (
                         <>
                           <div className="fixed inset-0 z-[100]" onClick={() => setIsGenreDropdownOpen(false)} />
                           <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                             className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-3xl z-[110] py-3 overflow-hidden"
                           >
                             <div className="px-5 py-2 border-b border-gray-50 dark:border-gray-800 mb-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Genres</p>
                             </div>
                             <div className="max-h-64 overflow-y-auto custom-scrollbar">
                               <button
                                 onClick={() => {
                                   setSelectedGenres([]);
                                   setIsGenreDropdownOpen(false);
                                 }}
                                 className={cn(
                                   "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                   selectedGenres.length === 0 
                                     ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                 )}
                               >
                                 <span>All Genres</span>
                                 {selectedGenres.length === 0 && <CheckCircle size={12} className="text-primary" />}
                               </button>
                               {genres.filter(g => g !== 'All Genres').map(g => {
                                 const isSelected = selectedGenres.includes(g);
                                 return (
                                   <button
                                     key={g}
                                     onClick={() => {
                                       setSelectedGenres(prev => 
                                         prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                                       );
                                     }}
                                     className={cn(
                                       "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                       isSelected 
                                         ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                     )}
                                   >
                                     <span className="truncate pr-6">{g}</span>
                                     {isSelected && <CheckCircle size={12} className="text-primary" />}
                                   </button>
                                 );
                               })}
                             </div>
                           </motion.div>
                         </>
                       )}
                     </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-3 relative">
                     <Globe className="text-primary" size={14} />
                     <div 
                       onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                       className={cn(
                         "flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all border",
                         selectedLanguages.length > 0 
                           ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                           : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary"
                       )}
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate">
                          {selectedLanguages.length === 0 ? 'Select Language' : selectedLanguages.join(', ')}
                        </span>
                        <ChevronRight size={12} className={cn("transition-transform", isLanguageDropdownOpen ? "rotate-90" : "rotate-0", selectedLanguages.length > 0 ? "text-white/70" : "text-gray-400")} />
                     </div>
                     
                     <AnimatePresence>
                       {isLanguageDropdownOpen && (
                         <>
                           <div className="fixed inset-0 z-[100]" onClick={() => setIsLanguageDropdownOpen(false)} />
                           <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                             className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-3xl z-[110] py-3 overflow-hidden"
                           >
                             <div className="px-5 py-2 border-b border-gray-50 dark:border-gray-800 mb-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Languages</p>
                             </div>
                             <div className="max-h-64 overflow-y-auto custom-scrollbar">
                               <button
                                 onClick={() => {
                                   setSelectedLanguages([]);
                                   setIsLanguageDropdownOpen(false);
                                 }}
                                 className={cn(
                                   "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                   selectedLanguages.length === 0 
                                     ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                 )}
                               >
                                 <span>All Languages</span>
                                 {selectedLanguages.length === 0 && <CheckCircle size={12} className="text-primary" />}
                               </button>
                               {languages.filter(l => l !== 'All Languages').map(l => {
                                 const isSelected = selectedLanguages.includes(l);
                                 return (
                                   <button
                                     key={l}
                                     onClick={() => {
                                       setSelectedLanguages(prev => 
                                         prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
                                       );
                                     }}
                                     className={cn(
                                       "w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                                       isSelected 
                                         ? "bg-primary/10 text-primary border-r-4 border-primary" 
                                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                     )}
                                   >
                                     <span className="truncate pr-6">{l}</span>
                                     {isSelected && <CheckCircle size={12} className="text-primary" />}
                                   </button>
                                 );
                               })}
                             </div>
                           </motion.div>
                         </>
                       )}
                     </AnimatePresence>
                  </div>
                 </>
               )}

               <div className="relative group ml-auto">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeCategory}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-14 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-full text-xs outline-none focus:border-primary min-w-[200px] text-gray-900 dark:text-white transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Zap size={10} className="text-gray-400" />
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
        
        {/* Active Filter Chips */}
        {(selectedTheater !== 'All Theaters' || selectedGenres.length > 0 || selectedLanguages.length > 0 || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Active:</span>
            {selectedTheater !== 'All Theaters' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Building size={12} />
                {selectedTheater}
                <button 
                  onClick={() => setSelectedTheater('All Theaters')}
                  className="ml-2 hover:text-orange-700 transition-colors"
                >
                  <Zap size={10} className="fill-primary" />
                </button>
              </div>
            )}
            {selectedGenres.map(g => (
              <div key={g} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Flame size={12} />
                {g}
                <button 
                  onClick={() => setSelectedGenres(prev => prev.filter(x => x !== g))}
                  className="ml-2 hover:text-orange-700 transition-colors"
                >
                  <Zap size={10} className="fill-primary" />
                </button>
              </div>
            ))}
            {selectedLanguages.map(l => (
              <div key={l} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Globe size={12} />
                {l}
                <button 
                  onClick={() => setSelectedLanguages(prev => prev.filter(x => x !== l))}
                  className="ml-2 hover:text-orange-700 transition-colors"
                >
                  <Zap size={10} className="fill-primary" />
                </button>
              </div>
            ))}
            {searchQuery && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <Search size={12} />
                "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Zap size={10} className="fill-gray-400" />
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setSelectedTheater('All Theaters');
                setSelectedGenres([]);
                setSelectedLanguages([]);
                setSearchQuery('');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30"
            >
              Clear All
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Scanning {activeCategory}...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <Globe size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500 font-bold">No results found in {city} for {activeCategory}.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleNodes.map((node, i) => {
                if (activeCategory === 'Movies' || activeCategory === 'Upcoming') {
                const now = new Date();
                const isUpcoming = !!node.metadata?.releaseDate && new Date(node.metadata?.releaseDate) > now;
                const relDate = node.metadata?.releaseDate ? new Date(node.metadata.releaseDate) : null;
                const isPreBooking = relDate && (relDate.getTime() - now.getTime()) <= (5 * 24 * 60 * 60 * 1000);

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/movie/${node.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md group-hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      <img src={node.imageUrl} alt={node.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Top Overlay Badges */}
                      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          {node.metadata?.language && (
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-white/20">
                              <Globe size={10} className="text-primary" />
                              {node.metadata.language}
                            </div>
                          )}
                          {isUpcoming && (
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-white/20">
                              <Calendar size={10} className="text-primary" />
                              {new Date(node.metadata!.releaseDate!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          )}
                          {isPreBooking && (
                            <div className="px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 animate-pulse ring-4 ring-primary/10">
                              <Zap size={10} />
                              Pre-Booking
                            </div>
                          )}
                        </div>

                        {node.rating && (
                          <div className="px-2 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-lg flex items-center gap-1 shadow-lg shadow-yellow-500/30">
                            <Star size={10} className="fill-black" />
                            {node.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Hover Content Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Synopsis</p>
                          <p className="text-white text-xs leading-relaxed mb-6 line-clamp-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                            {node.description || "No synopsis available for this title."}
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMovieBooking(node);
                            }}
                            className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all"
                          >
                            Book Experience
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate transition-colors">{node.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                         <div className="flex gap-0.5">
                           {[1, 2, 3, 4, 5].map(star => (
                             <Star key={star} size={10} className={star <= (node.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-200 dark:text-gray-700"} />
                           ))}
                         </div>
                         <span className="text-xs font-bold text-gray-900 dark:text-white">₹{node.price}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Transport & Events Style
              const isTransport = ['Trains', 'Bus', 'Flight'].includes(activeCategory);
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeCategory === 'Trains' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                      activeCategory === 'Bus' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                      activeCategory === 'Flight' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600'
                    }`}>
                      {activeCategory === 'Trains' ? <Train size={24} /> :
                       activeCategory === 'Bus' ? <Bus size={24} /> :
                       activeCategory === 'Flight' ? <Plane size={24} /> : <PartyPopper size={24} />}
                    </div>
                    {isTransport && (
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Starts from</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">₹{node.price}</div>
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">{node.title}</h4>
                  
                  {isTransport ? (
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={14} className="text-primary" />
                        <span>{node.venue} → Daily Route</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="text-primary" />
                        <span>Available hourly</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        {node.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded uppercase truncate">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{node.description}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                        <Calendar size={14} className="text-primary" />
                        {new Date(node.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50 dark:border-gray-800">
                        <span className="text-lg font-bold text-primary">₹{node.price}</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{node.venue}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedNode(node)}
                    className="w-full mt-6 py-3 bg-gray-900 dark:bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    Book Now <ArrowRight size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
          
          {/* Infinite Scroll Trigger */}
          {visibleNodes.length < nodes.length && (
            <div id="infinite-scroll-trigger" className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fetching more experiences...</p>
            </div>
          )}
        </>
        )}
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedNode && (
          <UniversalBookingPanel 
            node={selectedNode}
            onCancel={() => setSelectedNode(null)}
            onComplete={() => {
              setSelectedNode(null);
              navigate('/profile'); // Or wherever a success page is
            }}
          />
        )}
      </AnimatePresence>

      {/* Location Selection Modal */}
      <LocationSelectionModal 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCity={city}
        onSelectCity={(newCity) => setCity(newCity)}
      />

      {/* Featured Service */}
      <section className="bg-gray-50 dark:bg-gray-900/10 py-24 relative overflow-hidden transition-colors">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="text-primary font-bold uppercase tracking-widest text-xs mb-4">Partner Services</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900 dark:text-white transition-colors">
                Experience more than just <span className="text-primary">Movies.</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed text-lg transition-colors">
                TicketX partners with leading venues to provide exclusive access to premium events, travel options, and luxury stays. Everything you need for a perfect outing.
              </p>
              <ul className="space-y-4 mb-10">
                {['Verified Venues', 'Instant Confirmation', '24/7 Support'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500" /> {item}
                  </li>
                ))}
              </ul>
              <button className="px-10 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-bold rounded-xl flex items-center gap-3 hover:border-primary transition-all shadow-sm">
                Learn More <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl transition-colors">
                <img 
                  src="https://images.unsplash.com/photo-1474487056289-b682709fea2c?auto=format&fit=crop&q=80&w=1200" 
                  alt="Transit" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-white dark:bg-dark transition-colors">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />)}
            </div>
          </div>
          <p className="text-2xl md:text-4xl font-bold max-w-4xl mx-auto leading-tight text-gray-900 dark:text-white mb-8 transition-colors">
            "The easiest way to book tickets in the city. Reliable, fast, and always has the best seats."
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-bold text-primary transition-colors">JD</div>
             <div className="text-left">
                <div className="font-bold text-gray-900 dark:text-white text-sm">John Doe</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs">Frequent Explorer</div>
             </div>
          </div>
        </div>
      </section>

      {/* About Section - Developers Hub */}
      <div id="about">
        <AboutSection />
      </div>
    </div>
  );
};
