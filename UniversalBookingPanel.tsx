import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  Check, 
  Loader2, 
  Smartphone,
  Download,
  ArrowLeft,
  Lock,
  Wallet as WalletIcon,
  ShieldCheck,
  Zap,
  Info,
  Mail,
  Ticket,
  Landmark,
  CircleDollarSign,
  Globe,
  Building,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BookingNode } from '../services/entertainmentService';
import { collection, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { generateCryptographicTicket } from '../services/ticketPdfService';

// Category Specific Layouts
import MovieSeatMap from './booking/MovieSeatMap';
import BusLayout from './booking/BusLayout';
import TrainCoachLayout from './booking/TrainCoachLayout';
import EventTicketTier from './booking/EventTicketTier';
import FlightLayout from './booking/FlightLayout';
import HotelLayout from './booking/HotelLayout';

import { createBooking, verifyPayment } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UniversalBookingPanelProps {
  node: BookingNode;
  onComplete: (details: any) => void;
  onCancel: () => void;
  isFullPage?: boolean;
}

type BookingStep = 'selection' | 'refreshments' | 'checkout' | 'payment_method' | 'payment_details' | 'processing' | 'success';
type PaymentMethod = 'Card' | 'UPI' | 'PayPal' | 'Razorpay' | 'Wallet' | 'NetBanking';

import { StripePayment } from './payment/StripePayment';
import AuthModal from './AuthModal';

export default function UniversalBookingPanel({ node, onComplete, onCancel, isFullPage = false }: UniversalBookingPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<BookingStep>('selection');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selection, setSelection] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(node.price || 0);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Payment Form States
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [walletMobile, setWalletMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'details' | 'otp' | 'bank_login'>('selection');

  // Sync price on selection change
  useEffect(() => {
    calculateTotalPrice(selection);
  }, [selection]);

  const calculateTotalPrice = (data: any) => {
    // Priority: Use the total provided by the specialized layout component if it exists
    if (data.total !== undefined) {
      setTotalAmount(data.total);
      return;
    }

    let price = node.price;
    
    if (node.category === 'movie') {
      let seatTotal = 0;
      const TIERS = [
        { id: 'vip', priceMulti: 1.5, rows: ['A', 'B'] },
        { id: 'gold', priceMulti: 1.2, rows: ['C', 'D'] },
        { id: 'silver', priceMulti: 1.0, rows: ['E', 'F', 'G', 'H'] }
      ];

      if (data.seats && Array.isArray(data.seats)) {
        data.seats.forEach((seat: string) => {
          const row = seat ? seat.charAt(0) : 'A';
          const tier = TIERS.find(t => t.rows.includes(row));
          if (tier) seatTotal += node.price * tier.priceMulti;
        });
      }

      let fbTotal = 0;
      const FB_MENU = [
        { id: 'popcorn', price: 250 },
        { id: 'soda', price: 180 },
        { id: 'nachos', price: 320 },
        { id: 'burger', price: 380 },
        { id: 'pizza', price: 290 },
        { id: 'icecream', price: 210 },
        { id: 'coffee', price: 150 },
        { id: 'sandwich', price: 240 },
        { id: 'juice', price: 120 }
      ];
      if (data.refreshments) {
        Object.entries(data.refreshments).forEach(([id, count]) => {
          const item = FB_MENU.find(m => m.id === id);
          if (item) fbTotal += item.price * (count as number);
        });
      }
      
      price = data.seats?.length > 0 ? seatTotal + fbTotal : fbTotal;
    } else if (node.category === 'hotel') {
      price = data.total || node.price;
    } else if (data.seats && Array.isArray(data.seats)) {
      price = node.price * data.seats.length;
    }
    
    setTotalAmount(price);
  };

  const generateSignature = async (txId: string) => {
    const rawData = `${txId}:${node.title}:${totalAmount}:${node.category}`;
    const enc = new TextEncoder();
    const signatureBuffer = await crypto.subtle.digest('SHA-256', enc.encode(rawData));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16).toUpperCase();
    setSignature(signatureHex);
  };

  const handleSelectionUpdate = (data: any) => {
    setSelection(data);
    if (data.total) {
      setTotalAmount(data.total);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'TBA';
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Fallback if it's just a time string or other format
    return dateTimeStr;
  };

  const handleBack = () => {
    if (step === 'payment_details') {
      if (paymentMethod === 'NetBanking' && paymentStep === 'bank_login') {
        setPaymentStep('selection');
        setSelectedBank(null);
        return;
      }
      if (paymentMethod === 'Wallet' && paymentStep === 'otp') {
        setPaymentStep('selection');
        setIsOtpSent(false);
        setOtp('');
        return;
      }
      setStep('payment_method');
      setPaymentMethod(null);
      setLocalError(null);
      setPaymentStep('selection');
    } else if (step === 'payment_method') {
      setStep('checkout');
    } else if (step === 'checkout') {
      if (node.category === 'movie') {
        setStep('refreshments');
      } else {
        setStep('selection');
      }
    } else if (step === 'refreshments') {
      setStep('selection');
    } else if (step === 'selection') {
      if (onCancel) onCancel();
    }
  };

  const handleInitializeCheckout = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // For movies, if we haven't visited refreshments yet, go there
    if (node.category === 'movie' && step === 'selection') {
      setStep('refreshments');
      return;
    }

    setIsProcessing(true);
    setLoadingMessage("Initializing your booking session...");
    setLocalError(null);
    try {
      // Pre-create booking to get an ID for payment intent
      const bookingResponse = await createBooking({
        eventId: node.id,
        seats: (selection.seats && selection.seats.length > 0) ? selection.seats : ['AUTO'],
        amount: totalAmount || node.price || 1, // Ensure non-zero
        category: node.category,
        title: node.title,
        venue: node.venue,
        selection: selection
      });

      if (!bookingResponse.data || !bookingResponse.data.id) {
        throw new Error("Invalid response from booking server.");
      }

      setPendingBookingId(bookingResponse.data.id);
      setStep('payment_method');
    } catch (err: any) {
      console.error("Initialize checkout failed:", err);
      const msg = err.response?.data?.error || err.message || "Failed to initialize booking session.";
      setLocalError(msg);
      // Fallback for demo: if it fails but we are in a demo mode, allow proceeding with a dummy ID
      if (import.meta.env.DEV) {
        console.warn("API Failure in DEV - using fallback ID");
        setPendingBookingId("BK_DEMO_" + Math.random().toString(36).substring(2, 8).toUpperCase());
        setStep('payment_method');
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage(null);
    }
  };

  const handleFinalize = async (paymentIntent?: any) => {
    if (!user || !pendingBookingId) return;
    
    setIsProcessing(true);
    setLocalError(null);
    setStep('processing');
    
    try {
      // 1. Verify Payment in Backend (Update status to CONFIRMED) - CRITICAL STEP
      const verifyResponse = await verifyPayment({ 
        bookingId: pendingBookingId,
        paymentIntentId: paymentIntent?.id 
      });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.error || "Payment verification failed.");
      }

      // 2. Real-time seats update (Best effort, needs Firebase Auth)
      try {
        if (auth.currentUser && node.category === 'movie' && selection.seats?.length > 0) {
          const scheduleRef = doc(db, 'schedules', node.id);
          const scheduleSnap = await getDoc(scheduleRef);
          if (scheduleSnap.exists()) {
            await updateDoc(scheduleRef, {
              bookedSeats: arrayUnion(...selection.seats)
            });
          }
        }
      } catch (fbErr) {
        console.warn("Secondary Firestore seat update failed (likely missing FB Auth):", fbErr);
      }

      // 3. Create Transaction Record (Best effort, fallback to backend booking ID)
      let finalTxId = pendingBookingId;
      try {
        if (auth.currentUser) {
          const docRef = await addDoc(collection(db, 'transactions'), {
            userId: auth.currentUser.uid,
            nodeId: node.id,
            bookingId: pendingBookingId,
            title: node.title,
            category: node.category,
            amount: totalAmount,
            paymentMethod: paymentMethod,
            timestamp: serverTimestamp(),
            status: 'completed',
            selection: selection,
            metadata: node.metadata || {},
            userEmail: auth.currentUser.email,
            stripeId: paymentIntent?.id
          });
          finalTxId = docRef.id;
        } else {
          console.log("Firebase Auth not active, using backend ID for transaction.");
        }
      } catch (txErr) {
        console.warn("Transaction log creation failed (likely missing FB Auth):", txErr);
      }
      
      setTransactionId(finalTxId);
      await generateSignature(finalTxId);
      setIsSuccess(true);
      setStep('success');
      
    } catch (error: any) {
      console.error("Confirmation failed:", error);
      const errorMessage = error.response?.data?.error || error.message || "Internal validation error.";
      setLocalError(`Transaction confirmation failed: ${errorMessage}`);
      setStep('payment_method'); // Go back to payment method selection on failure
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCheckoutSummary = () => (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative">
        <div className="absolute top-0 right-0 p-4">
           <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
              <Ticket size={24} className="text-primary opacity-40" />
           </div>
        </div>

        <div className="relative mb-12">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-4">Step 02 — Booking Details</span>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Confirm Your Selection</h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 space-y-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-200 dark:border-gray-800 pb-10">
              <div className="space-y-2">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{node.category === 'movie' ? 'Movie Title' : 'Feature / Production'}</p>
                 <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{node.title}</h4>
                 <div className="flex items-center gap-3">
                    <MapPin size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{node.category === 'movie' ? 'Theater' : 'Venue'}: {node.venue}</span>
                 </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 min-w-[180px]">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{node.category === 'movie' ? 'Selected Seats' : 'Allocated Space'}</p>
                 <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selection.seats) ? selection.seats : [selection.seats || 'AUTO']).map((seat: string) => (
                      <span key={seat} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none">
                        {seat}
                      </span>
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</p>
                 <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase">{node.category}</p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{node.category === 'movie' ? 'Showtime' : 'Date & Time'}</p>
                 <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase">
                   {formatDateTime(node.dateTime)}
                 </p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Unit Price</p>
                 <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase">₹{node.price}</p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Fees</p>
                 <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase">₹0.00</p>
              </div>
           </div>

           <div className="pt-10 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{node.category === 'movie' ? 'Total Booking Price' : 'Total Chargeable'}</span>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹{totalAmount}</span>
                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Inclusive of all taxes</p>
              </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <button 
              onClick={handleInitializeCheckout}
              disabled={isProcessing}
              className="flex-1 py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16} /> PROCEED TO PAYMENT</>}
            </button>
            <button 
              onClick={() => setStep('selection')}
              className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl transition-all uppercase text-[10px] tracking-[0.3em] hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Modify Selection
            </button>
        </div>
      </div>
    </div>
  );

  const renderSelectionStep = () => {
    switch (node.category) {
      case 'movie':
        return <MovieSeatMap node={node} onUpdate={handleSelectionUpdate} />;
      case 'bus':
        return <BusLayout node={node} onSeatSelect={(seats) => handleSelectionUpdate({ seats })} />;
      case 'train':
        return <TrainCoachLayout node={node} onSeatSelect={(seats) => handleSelectionUpdate({ seats })} />;
      case 'event':
        return <EventTicketTier node={node} onSeatSelect={(seats) => handleSelectionUpdate({ seats })} />;
      case 'flight':
        return <FlightLayout node={node} onSeatSelect={(seats) => handleSelectionUpdate({ seats })} />;
      case 'hotel':
        return <HotelLayout node={node} onUpdate={handleSelectionUpdate} />;
      default:
        return (
          <div className="py-20 text-center space-y-6">
            <Zap className="mx-auto text-primary animate-pulse" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary/40">Generic Node Protocols Ready</p>
            <button onClick={handleInitializeCheckout} className="px-10 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-[0.4em]">INITIATE CHECKOUT PROTOCOL</button>
          </div>
        );
    }
  };

  const renderPaymentGateway = () => {
    switch (paymentMethod) {
      case 'Card':
        return (
          <div className="max-w-md mx-auto">
            {pendingBookingId ? (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Sandbox Mode Active</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">Simulating Stripe Payment Gateway for {pendingBookingId}</p>
                </div>
                
                <StripePayment 
                  bookingId={pendingBookingId}
                  amount={totalAmount}
                  onSuccess={(pi) => handleFinalize(pi)}
                  onError={(err) => setLocalError(err)}
                />
              </div>
            ) : (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}
            {localError && (
              <p className="mt-4 text-red-500 text-xs font-bold uppercase tracking-widest bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {localError}
              </p>
            )}
          </div>
        );
      case 'UPI':
        return (
          <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="text-primary" size={32} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight mb-2">UPI Payment</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Pay using GPay, PhonePe, or Paytm</p>
               
               <div className="space-y-4">
                  <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-primary transition-all">
                     <div className="w-10 h-10 bg-white rounded-lg p-2 shadow-sm">
                        <div className="w-full h-full bg-blue-600 rounded-sm opacity-20" />
                     </div>
                     <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest">Connect App</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Quick Redirect</p>
                     </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100 dark:border-gray-700"></span></div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]"><span className="bg-white dark:bg-gray-800 px-4 text-gray-300">OR ENTER VPA</span></div>
                  </div>

                  <input 
                    type="text" 
                    placeholder="example@upi" 
                    className="w-full py-4 px-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-mono focus:border-primary transition-all text-center"
                  />
               </div>
            </div>

            <button 
              onClick={() => handleFinalize({ id: 'dummy_upi_' + Date.now(), method: 'UPI' })}
              disabled={isProcessing}
              className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `PAY ₹${totalAmount}`}
            </button>
          </div>
        );
      case 'Wallet':
        const wallets = [
          { id: 'amazon', name: 'Amazon Pay', balance: 2450, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { id: 'paytm', name: 'Paytm Wallet', balance: 1840, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { id: 'mobikwik', name: 'MobiKwik', balance: 520, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { id: 'phonepe', name: 'PhonePe Wallet', balance: 3100, color: 'text-purple-500', bg: 'bg-purple-500/10' }
        ];

        if (paymentStep === 'otp') {
          return (
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="text-primary" size={32} />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Verify Wallet Access</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                   Enter the 6-digit OTP sent to your linked mobile number <span className="text-gray-900 dark:text-white"> ending in 8821</span>
                 </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-6 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <input 
                      key={i}
                      type="text" 
                      maxLength={1}
                      className="w-full h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center font-black text-lg focus:border-primary transition-all"
                      value={otp[i-1] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                          const newOtp = otp.split('');
                          newOtp[i-1] = val;
                          setOtp(newOtp.join(''));
                        }
                      }}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center px-2">
                   <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">Resend Code</button>
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest">00:45</span>
                </div>
              </div>

              <button 
                onClick={() => handleFinalize({ id: 'dummy_wallet_' + Date.now(), method: 'Wallet', walletId: selectedWallet })}
                disabled={isProcessing || otp.length < 6}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `COMPLETE AUTHORIZATION`}
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="grid grid-cols-1 gap-4">
                {wallets.map(w => (
                  <button 
                    key={w.id}
                    onClick={() => setSelectedWallet(w.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all flex items-center justify-between group",
                      selectedWallet === w.id 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                        : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center gap-4">
                       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", w.bg)}>
                          <WalletIcon className={w.color} size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{w.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Linked Account</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-gray-900 dark:text-white">₹{w.balance}</p>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Available</p>
                    </div>
                  </button>
                ))}
             </div>

             {selectedWallet && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-6 bg-gray-900 border border-white/10 rounded-3xl text-white shadow-2xl relative overflow-hidden"
               >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Deduction Summary</p>
                       <ShieldCheck size={16} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-end mb-4">
                       <div className="text-2xl font-black tracking-tighter">- ₹{totalAmount}</div>
                       <div className="text-[10px] font-bold text-gray-400">Total Settlement</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                       <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                         Updated Balance: ₹{(wallets.find(w => w.id === selectedWallet)?.balance || 0) - totalAmount}
                       </p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
               </motion.div>
             )}

             <button 
               onClick={() => setPaymentStep('otp')}
               disabled={isProcessing || !selectedWallet}
               className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 disabled:opacity-50"
             >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `LINK & GENERATE OTP`}
            </button>
          </div>
        );
      case 'PayPal':
      case 'Razorpay':
        return (
          <div className="max-w-md mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all" />
                <div className="relative w-24 h-24 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl mb-8">
                   <ShieldCheck className="text-primary" size={40} />
                </div>
             </div>
             <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{paymentMethod} Integration</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                   You are about to be redirected to the secure {paymentMethod} sandbox for authorization.
                </p>
             </div>
             
             <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-left">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gateway Status</span>
                   <span className="flex items-center gap-2 text-[9px] font-black text-green-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ready
                   </span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '100%' }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                     className="h-full bg-primary"
                   />
                </div>
             </div>

             <button 
               onClick={() => handleFinalize({ id: `dummy_${paymentMethod?.toLowerCase()}_${Date.now()}` })} 
               disabled={isProcessing}
               className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3"
             >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `LAUNCH ${paymentMethod?.toUpperCase()} PORTAL`}
             </button>
          </div>
        );
      case 'NetBanking':
        const banks = [
          { id: 'hdfc', name: 'HDFC Bank', code: 'HDF', color: 'text-blue-700', bg: 'bg-blue-700/10' },
          { id: 'icici', name: 'ICICI Bank', code: 'ICI', color: 'text-orange-600', bg: 'bg-orange-600/10' },
          { id: 'sbi', name: 'SBI', code: 'SBI', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { id: 'axis', name: 'Axis Bank', code: 'AXS', color: 'text-red-900', bg: 'bg-red-900/10' },
          { id: 'kotak', name: 'Kotak Bank', code: 'KOT', color: 'text-red-600', bg: 'bg-red-600/10' },
          { id: 'yes', name: 'YES Bank', code: 'YES', color: 'text-blue-400', bg: 'bg-blue-400/10' }
        ];

        const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
        const activeBank = banks.find(b => b.id === selectedBank);

        if (paymentStep === 'bank_login' && activeBank) {
          return (
            <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-700 pb-8">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs", activeBank.bg, activeBank.color)}>
                        {activeBank.code}
                     </div>
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">{activeBank.name}</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Secure Login Portal</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer ID / User ID</label>
                        <input 
                          type="text" 
                          placeholder="Your ID"
                          className="w-full py-4 px-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-mono focus:border-primary transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          className="w-full py-4 px-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-mono focus:border-primary transition-all"
                        />
                     </div>
                  </div>
               </div>

               <button 
                onClick={() => handleFinalize({ id: 'dummy_nb_' + Date.now(), bank: activeBank.name })}
                disabled={isProcessing}
                className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40 flex items-center justify-center gap-3"
               >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : `SIGN IN & COMPLETE PAYMENT`}
               </button>
            </div>
          );
        }

        return (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-400">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search for your bank..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {filteredBanks.map(bank => (
                 <button 
                  key={bank.id}
                  onClick={() => { setSelectedBank(bank.id); setPaymentStep('bank_login'); }}
                  className={cn(
                    "p-6 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-[2rem] transition-all text-left flex flex-col gap-4 group",
                    "hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                  )}
                 >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs", bank.bg, bank.color)}>
                       {bank.code}
                    </div>
                    <div className="flex items-center justify-between w-full">
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-primary transition-colors">{bank.name}</span>
                       <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                 </button>
               ))}
            </div>
            
            {filteredBanks.length === 0 && (
              <div className="py-12 text-center text-gray-500 space-y-4">
                <Landmark className="mx-auto opacity-20" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest">No banks match your search</p>
              </div>
            )}

            <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-3 text-secondary/40">
                  <Lock size={14} />
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">AES-256 Bit Secure Bank Protocol Active</p>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-1">
            {[
              { id: 'Card', label: 'Credit / Debit', sub: 'Visa, Master, Rupay', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10', tag: null, logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" },
              { id: 'UPI', label: 'Smart UPI', sub: 'Paytm, GPay, PhonePe', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', tag: 'Safe & Instant', logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" },
              { id: 'PayPal', label: 'PayPal Global', sub: 'International Bridge', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-500/10', tag: null, logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
              { id: 'Razorpay', label: 'Razorpay Hub', sub: 'Optimized Gateway', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', tag: 'Fastest', logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Razorpay_Logo.png" },
              { id: 'Wallet', label: 'Digital Wallets', sub: 'Amazon, Mobikwik', icon: WalletIcon, color: 'text-green-600', bg: 'bg-green-500/10', tag: null, logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Wallet_Flat_Icon.svg" },
              { id: 'NetBanking', label: 'Net Banking', sub: 'All Indian Banks', icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-500/10', tag: null, logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/NetBanking-Icon.svg" }
            ].map((method, idx) => (
              <motion.button 
                key={method.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { setPaymentMethod(method.id as PaymentMethod); setStep('payment_details'); }}
                className={cn(
                  "relative group p-10 rounded-[3rem] border text-left transition-all duration-500 overflow-hidden",
                  "bg-white dark:bg-gray-800/10 border-gray-100 dark:border-gray-800 shadow-sm",
                  "hover:border-primary hover:shadow-[0_30px_70px_rgba(242,125,38,0.2)] hover:-translate-y-3"
                )}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 dark:bg-gray-900 rounded-full -mr-24 -mt-24 group-hover:bg-primary/5 transition-colors" />
                
                {method.tag && (
                  <div className="absolute top-8 left-8 px-4 py-1.5 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20 z-10">
                    {method.tag}
                  </div>
                )}
                
                <div className="relative z-10 flex flex-col h-full space-y-10">
                  <div className="flex items-center justify-between">
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg shadow-black/5", method.bg)}>
                      <method.icon className={cn("transition-colors", method.color)} size={40} />
                    </div>
                    {method.logo && (
                      <div className="h-12 max-w-[100px] flex items-center justify-end grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500">
                        <img src={method.logo} alt={method.id} className="h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[14px] font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-primary transition-colors">{method.label}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-80 leading-tight">{method.sub}</p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Gateway Encrypted</span>
                     </div>
                     <ArrowLeft className="text-gray-300 group-hover:text-primary rotate-180 transition-all transform group-hover:translate-x-2" size={18} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        );
    }
  };

  if (!node) return null;

  return (
    <div className={cn(
      isFullPage ? "relative w-full h-full" : "fixed inset-0 z-[60] flex items-center justify-center p-4"
    )}>
      {!isFullPage && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />}
      
      <motion.div
        initial={isFullPage ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={cn(
          "relative bg-white dark:bg-dark border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-2xl transition-colors",
          isFullPage ? "w-full h-full rounded-2xl" : "w-full max-w-4xl rounded-2xl max-h-[90vh]"
        )}
      >
        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex items-center gap-6">
              {step !== 'success' && (
                <button 
                  onClick={handleBack} 
                  className="flex items-center gap-3 p-2 px-4 border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-primary hover:text-primary transition-all rounded-xl group"
                >
                   <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
                </button>
              )}
              <div className="text-left">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{node.title}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary px-2.5 py-1 bg-primary/10 rounded-full border border-primary/20">{node.category}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    <MapPin size={10} className="text-primary" /> {node.venue}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-[0.2em] block mb-1">Authorization Amount</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{totalAmount}</span>
            </div>
          </div>

          {localError && step !== 'payment_details' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <Info className="text-red-500" size={16} />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest leading-relaxed">{localError}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'selection' ? (
              <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">
                {renderSelectionStep()}
                <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-dark via-white/80 dark:via-dark/80 to-transparent pointer-events-none transition-colors">
                  <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
                    <button 
                      onClick={handleInitializeCheckout}
                      disabled={isProcessing || (node.category === 'movie' && (!selection.seats || selection.seats.length === 0))}
                      className="px-12 py-5 bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50 flex items-center gap-3"
                    >
                      {isProcessing && <Loader2 className="animate-spin" size={16} />}
                      {node.category === 'movie' ? 'Provisions & Refreshments' : 'Review Order'} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : step === 'refreshments' ? (
              <motion.div key="refreshments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 pb-24">
                 <div className="text-center space-y-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Optional Enhancement</span>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Refreshment Protocol</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                       Pre-order snacks and beverages for a seamless theatre experience.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'popcorn', label: 'Classic Popcorn', price: 250, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=600' },
                      { id: 'soda', label: 'Chilled Soda', price: 180, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600' },
                      { id: 'nachos', label: 'Cheesy Nachos', price: 320, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=600' },
                      { id: 'burger', label: 'Premium Burger', price: 380, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
                      { id: 'pizza', label: 'Gourmet Pizza', price: 290, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600' },
                      { id: 'icecream', label: 'Artisanal Ice Cream', price: 210, image: 'https://images.unsplash.com/photo-1567206491228-591aef594681?auto=format&fit=crop&q=80&w=600' },
                      { id: 'coffee', label: 'Fresh Brewed Coffee', price: 150, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=600' },
                      { id: 'sandwich', label: 'Club Sandwich', price: 240, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600' },
                      { id: 'juice', label: 'Seasonal Fruit Juice', price: 120, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=600' }
                    ].map(item => {
                      const count = selection.refreshments?.[item.id] || 0;
                      return (
                        <div key={item.id} className={cn(
                          "group rounded-[2rem] border transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-1 shadow-md",
                          count > 0 ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 shadow-sm"
                        )}>
                          <div className="h-48 overflow-hidden relative">
                             <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                             {count > 0 && <div className="absolute top-4 right-4 px-4 py-2 bg-primary text-white text-[10px] font-black rounded-xl shadow-xl animate-in zoom-in duration-300">{count} Selected</div>}
                          </div>
                          <div className="p-6 space-y-4">
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{item.label}</h4>
                                   <p className="text-[10px] font-black text-primary mt-1">₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800">
                                   <button 
                                    onClick={() => {
                                      const nextFB = { ...(selection.refreshments || {}) };
                                      nextFB[item.id] = Math.max(0, (nextFB[item.id] || 0) - 1);
                                      if (nextFB[item.id] === 0) delete nextFB[item.id];
                                      handleSelectionUpdate({ ...selection, refreshments: nextFB });
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                   >
                                     -
                                   </button>
                                   <span className="text-xs font-black min-w-[1.5rem] text-center">{count}</span>
                                   <button 
                                    onClick={() => {
                                      const nextFB = { ...(selection.refreshments || {}) };
                                      nextFB[item.id] = (nextFB[item.id] || 0) + 1;
                                      handleSelectionUpdate({ ...selection, refreshments: nextFB });
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all"
                                   >
                                     +
                                   </button>
                                </div>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                 </div>

                 <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-dark via-white/80 dark:via-dark/80 to-transparent pointer-events-none">
                    <div className="max-w-4xl mx-auto flex justify-between items-center pointer-events-auto">
                        <button onClick={() => setStep('checkout')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Skip for now</button>
                        <button 
                          onClick={() => setStep('checkout')}
                          className="px-12 py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 shadow-2xl shadow-primary/20"
                        >
                          Continue To Checkout <ChevronRight size={16} />
                        </button>
                    </div>
                 </div>
              </motion.div>
            ) : step === 'checkout' ? (
              <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                 {renderCheckoutSummary()}
              </motion.div>
            ) : step === 'payment_method' || step === 'payment_details' ? (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-20">
                <h3 className="text-[10px] font-black mb-10 text-gray-400 dark:text-gray-600 text-center uppercase tracking-[0.4em]">
                  {step === 'payment_method' ? 'Secure Gateway Selection' : 'Confirm Authorized Details'}
                </h3>
                {renderPaymentGateway()}
              </motion.div>
            ) : step === 'processing' ? (
              <motion.div key="processing" className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                  <Loader2 className="animate-spin text-primary" size={64} strokeWidth={3} />
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black text-primary tracking-[0.4em] animate-pulse uppercase">
                    {loadingMessage || "Handshaking with Gateway..."}
                  </span>
                  <p className="text-[8px] text-gray-400 uppercase mt-4 tracking-widest">End-to-end encryption active</p>
                </div>
              </motion.div>
            ) : step === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-8">
                <div className="text-center mb-10">
                   <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
                      <Check className="text-green-600 dark:text-green-400" size={40} strokeWidth={3} />
                   </div>
                   <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter">Protocol Success</h3>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">Digital tokens dispatched to <span className="text-gray-900 dark:text-white font-bold">{user?.email || 'your email'}</span></p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 space-y-8 transition-colors">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em]">
                         <ShieldCheck size={20} /> Encrypted Ticket
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-100">
                         <QRCodeCanvas 
                           value={`${transactionId}:${signature}`}
                           size={80}
                           level="H"
                         />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-y-10 gap-x-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                      <div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] block mb-2">TXN Ident</span>
                        <p className="font-black text-gray-900 dark:text-white truncate uppercase tracking-widest text-xs">{transactionId}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] block mb-2">Status</span>
                        <p className="font-black text-green-600 dark:text-green-400 uppercase tracking-widest text-xs">AUTHORIZED</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] block mb-2">Slot Identification</span>
                        <p className="font-black text-gray-900 dark:text-white tracking-widest text-xs">
                           {node.dateTime ? formatDateTime(node.dateTime) : 'IMMEDIATE'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] block mb-2">Allocated Seats</span>
                        <p className="font-black text-gray-900 dark:text-white tracking-widest text-xs">{Array.isArray(selection.seats) ? selection.seats.join(', ') : selection.seats || 'AUTO'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] block mb-2">Final Settlement</span>
                        <p className="font-black text-gray-900 dark:text-white tracking-widest text-xs">₹{totalAmount}</p>
                      </div>
                   </div>

                   <button 
                     onClick={() => generateCryptographicTicket({
                        id: transactionId!,
                        title: node.title,
                        amount: totalAmount,
                        category: node.category,
                        timestamp: { toDate: () => new Date() },
                        selection
                     })} 
                     className="w-full flex items-center justify-center gap-4 py-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-900 dark:text-white font-black rounded-2xl transition-all shadow-sm uppercase text-[10px] tracking-[0.2em]"
                   >
                     <Download size={18} /> Sync offline token
                   </button>
                </div>
                
                <button 
                  onClick={() => {
                    const details = { ...selection, transactionId, signature };
                    onComplete(details);
                    navigate('/booking-success', { 
                      state: { 
                        transactionId, 
                        title: node.title,
                        venue: node.venue,
                        seats: selection.seats,
                        amount: totalAmount,
                        category: node.category,
                        imageUrl: node.imageUrl,
                        selection: {
                          ...selection,
                          venue: node.venue,
                          title: node.title
                        }
                      } 
                    });
                  }} 
                  className="w-full mt-10 py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/40"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
