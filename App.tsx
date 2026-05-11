import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Ticket, 
  User, 
  Star, 
  Globe,
  Navigation,
  LogOut,
  Layers,
  Search,
  Bell,
  Clock,
  X,
  Sidebar,
  Database,
  Film,
  Train,
  Building,
  PartyPopper,
  Info
} from 'lucide-react';
import InfoModal from './components/InfoModal';
import UniversalBookingPanel from './components/UniversalBookingPanel';
import ChatWidget from './components/ChatWidget';
import AboutSection from './components/AboutSection';
import CinematicIntro from './components/CinematicIntro';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LocationProvider } from './hooks/useLocation';
import { getNotifications } from './services/api';
import { searchBookingNodes, BookingNode, BookingCategory } from './services/entertainmentService';
import { seedDatabase } from './services/seedService';
import { cn } from './lib/utils';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import UserDashboard from './components/UserDashboard';

import ErrorBoundary from './components/ErrorBoundary';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MovieDetails } from './pages/MovieDetails';
import { TheaterSelection } from './pages/TheaterSelection';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { BookingSuccess } from './pages/BookingSuccess';
import TheaterDetails from './pages/TheaterDetails';
import Terms from './pages/Terms';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function AppWrapper() {
  return (
    <Router>
      <ErrorBoundary>
        <LocationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LocationProvider>
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  const { loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    // Auto-seed if missing v4 flag
    const hasSeeded = localStorage.getItem('ticketx_v4_seeded');
    if (!hasSeeded) {
      seedDatabase().then(() => {
        localStorage.setItem('ticketx_v4_seeded', 'true');
        console.log("Initial seed v4 complete.");
      }).catch(console.error);
    }
    
    // Safety fallback: if loading takes > 8 seconds, force ready anyway
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timed out, forcing ready.");
        setForceReady(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !forceReady) return (
    <div className="min-h-screen bg-white dark:bg-dark flex items-center justify-center transition-colors">
       <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-white font-sans transition-colors">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <CinematicIntro key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen"
          >
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:movieId" element={<MovieDetails />} />
                <Route path="/theater/:theaterId" element={<TheaterDetails />} />
                <Route path="/checkout/theaters/:movieId" element={<TheaterSelection />} />
                <Route path="/checkout/seats/:scheduleId" element={
                  <ProtectedRoute>
                    <SeatSelectionPage />
                  </ProtectedRoute>
                } />
                <Route path="/booking-success" element={<BookingSuccess />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
