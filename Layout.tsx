import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  Bell, 
  Clock, 
  LogOut, 
  Globe, 
  X, 
  Menu,
  ChevronDown,
  Navigation,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLocationContext } from '../hooks/useLocation';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';
import UserDashboard from './UserDashboard';
import ChatWidget from './ChatWidget';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showAuthModal, setShowAuthModal] = useState(location.state?.openAuth || false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const { isDark, setIsDark, accentColor, setAccentColor } = useTheme();
  const { city: currentCity, setCity: setCurrentCity } = useLocationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
  };

  useEffect(() => {
    if (location.state?.openAuth) {
      setShowAuthModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cities = ['Narasaraopet', 'Hyderabad', 'Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Kochi'];

  const colors: Array<'orange' | 'blue' | 'purple' | 'green' | 'red'> = ['orange', 'blue', 'purple', 'green', 'red'];

  const colorStyles = {
    orange: 'bg-[#ff6b00]',
    blue: 'bg-[#3b82f6]',
    purple: 'bg-[#8b5cf6]',
    green: 'bg-[#10b981]',
    red: 'bg-[#ef4444]',
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-white font-sans transition-colors duration-300", isDark && "dark")}>
      <header className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-500 border-b",
        scrolled 
          ? "bg-white/80 dark:bg-dark/80 backdrop-blur-2xl py-3 border-gray-100 dark:border-gray-800 shadow-sm" 
          : "bg-transparent py-5 border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-8">
          {/* Logo & Back Button */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all shadow-sm"
              >
                <ChevronDown className="rotate-90 text-gray-400 group-hover:text-primary transition-colors" size={20} />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-4 group relative">
              <div className="relative">
                {/* Monolithic Base */}
                <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center font-black text-white text-3xl shadow-2xl group-hover:scale-105 transition-all duration-500 border border-white/10 overflow-hidden relative">
                  {/* Brushed Titanium Texture Overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
                  
                  {/* Plasma 'X' Core */}
                  <div className="relative z-10 font-black tracking-tighter flex items-center justify-center">
                     <span className="text-white drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">T</span>
                     <div className="relative mx-[-2px]">
                        <span className="text-primary italic animate-pulse drop-shadow-[0_0_15px_rgba(242,125,38,0.8)]">X</span>
                        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                     </div>
                  </div>

                  {/* Teal Rim Lighting (Left) */}
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-teal-400/50 shadow-[2px_0_10px_rgba(45,212,191,0.5)]" />
                </div>
                
                {/* Pro Badge (Copper finish below X) */}
                <div className="absolute -bottom-1 -right-2 px-2 py-0.5 bg-gradient-to-r from-orange-800 to-orange-600 rounded-md border border-white/20 shadow-lg transform rotate-[-2deg]">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white">PRO</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-black tracking-tighter uppercase text-gray-900 dark:text-white leading-none transition-colors">
                    Ticket<span className="text-primary italic drop-shadow-sm">X</span>
                  </span>
                  <span className="text-[10px] font-black text-orange-700 leading-none mb-1">PRO</span>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-teal-500 via-primary to-transparent mt-1 opacity-50" />
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500 leading-none mt-1 transition-colors">
                  Next-Gen Entertainment
                </span>
              </div>
            </Link>
          </div>

          {/* Location & Search (Desktop) */}
          <div className="hidden lg:flex flex-1 items-center gap-4 max-w-2xl">
            <div className="relative group min-w-[160px]">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/50 transition-all cursor-pointer">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">{currentCity}</span>
                <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
              </div>
              
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[110] shadow-xl">
                {cities.map(city => (
                  <button 
                    key={city}
                    onClick={() => setCurrentCity(city)}
                    className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 text-gray-700 dark:text-gray-300"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Search movies, venues, events..."
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-all font-medium placeholder:text-gray-400 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Real-time Clock */}
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 border-l border-gray-100 dark:border-gray-800 animate-in fade-in duration-700">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{formatTime(currentTime)}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">{formatDate(currentTime)}</span>
               </div>
               <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <Clock size={14} className="text-gray-400 animate-pulse" />
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative group">
              <button 
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary transition-all"
                title="Change Primary Color"
              >
                <Palette size={20} />
              </button>
              <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex gap-3 shadow-xl z-[110]">
                {colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={cn(
                      "w-4 h-4 rounded-full transition-transform hover:scale-125",
                      colorStyles[color],
                      accentColor === color && "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                    )}
                  />
                ))}
              </div>
            </div>

            {user ? (
              <>
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-all relative"
                >
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="hidden sm:flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all group"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name || 'User'} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                      {typeof user.name === 'string' && user.name.length > 0 ? user.name[0] : 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase text-gray-400 leading-none mb-0.5">Profile</div>
                    <div className="text-xs font-bold truncate max-w-[100px] text-gray-900">{user.name || 'User'}</div>
                  </div>
                </button>
                <button 
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 bg-primary text-white font-bold uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-all transform active:scale-95 text-xs shadow-lg shadow-primary/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 bg-white dark:bg-dark transition-colors">
        {children}
      </main>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-[160] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400"><X/></button>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Bell size={48} className="mb-4 text-gray-300" />
                <p className="uppercase tracking-[0.2em] font-bold text-xs text-gray-400">No new notifications</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatWidget />
      <AnimatePresence>
        {showDashboard && <UserDashboard onClose={() => setShowDashboard(false)} />}
      </AnimatePresence>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <footer className="bg-white dark:bg-dark border-t border-gray-100 dark:border-gray-800 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 bg-gray-900 dark:bg-primary rounded-lg flex items-center justify-center font-black text-white text-lg">T</div>
                 <span className="text-xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">Ticket<span className="text-primary italic">X</span></span>
               </div>
               <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest max-w-xs leading-loose transition-colors">
                 Next-generation entertainment booking engine. Scalable. Secure. Seamless.
               </p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-12 gap-y-6">
               {[
                 { label: 'Movies', path: '/' },
                 { label: 'Developers', path: '/#about', scroll: true },
                 { label: 'Terms', path: '/terms' },
                 { label: 'Support', path: '/' }
               ].map(link => (
                 link.scroll ? (
                   <button 
                     key={link.label}
                     onClick={() => {
                        if (window.location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 500);
                        } else {
                          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                        }
                     }}
                     className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                   >
                     {link.label}
                   </button>
                 ) : (
                   <Link 
                     key={link.label}
                     to={link.path}
                     className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                   >
                     {link.label}
                   </Link>
                 )
               ))}
            </nav>

            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
              © 2026 TicketX. Build V.1.00
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
