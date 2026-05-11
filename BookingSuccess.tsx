import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Calendar, MapPin, Ticket, ArrowRight, Download, Share2, Home, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateCryptographicTicket } from '../services/ticketPdfService';
import { BookingQRCode } from '../components/BookingQRCode';

export const BookingSuccess: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark p-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
             <Ticket size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">No Active Session</h2>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { transactionId, title, venue, seats, amount, category } = state;

  const handleDownload = async () => {
    const transaction = {
      id: transactionId,
      title: title,
      amount: amount,
      category: category,
      imageUrl: state.imageUrl,
      venue: venue,
      selection: state.selection
    };
    await generateCryptographicTicket(transaction);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-dark transition-colors">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center mb-12"
        >
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40 relative z-10">
              <CheckCircle size={48} strokeWidth={3} />
            </div>
            <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">
            Booking <span className="text-green-500">Confirmed!</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            Your transaction was successful. Reference: <span className="text-gray-900 dark:text-white font-bold">{transactionId}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden"
        >
          <div className="p-8 md:p-12 space-y-10">
            {/* Ticket Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-3 inline-block",
                  category === 'movie' ? "bg-primary/10 text-primary border-primary/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}>
                  {category}
                </span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</h2>
              </div>
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center p-2">
                 <div className="w-full h-full bg-gray-900 dark:bg-white rounded-lg opacity-10" />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-100 dark:border-gray-800">
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-primary" /> Venue / Location
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">{venue}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Ticket size={12} className="text-primary" /> Seats / Slot
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">{Array.isArray(seats) ? seats.join(', ') : (seats || 'General')}</p>
               </div>
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-primary" /> Date & Time
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white uppercase text-sm">
                    {state.selection?.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} • {state.selection?.time || '06:30 PM'}
                  </p>
               </div>
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Ticket size={12} className="text-primary" /> Total Paid
                  </span>
                  <p className="font-black text-primary text-xl tracking-tighter">₹{amount}</p>
               </div>
            </div>

            {/* QR Code Verification Section */}
            <div className="flex flex-col items-center justify-center py-6 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
               <BookingQRCode transactionId={transactionId} ticketData={{ title, amount, category }} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                onClick={handleDownload}
                className="flex items-center justify-center gap-3 py-4 bg-gray-900 dark:bg-primary text-white font-black rounded-2xl hover:bg-black dark:hover:bg-orange-600 transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
               >
                  <Download size={16} /> Download E-Ticket
               </button>
               <button className="flex items-center justify-center gap-3 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-black rounded-2xl hover:border-primary transition-all uppercase text-[10px] tracking-widest">
                  <Share2 size={16} /> Share With Friends
               </button>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800/40 p-6 text-center">
             <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Please present the QR code at the entrance for verification.</p>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
           <Link 
            to="/"
            className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-primary font-black uppercase text-[10px] tracking-widest transition-colors group"
           >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
           </Link>
           <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
           <Link 
            to="/profile"
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary font-black uppercase text-[10px] tracking-widest transition-colors"
           >
              View My Bookings <ArrowRight size={14} />
           </Link>
        </div>
      </div>
    </div>
  );
};
