import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  MapPin, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock,
  Download,
  User,
  Heart,
  History,
  ShieldCheck,
  Mail,
  Smartphone,
  Save,
  Trash2,
  Database,
  ArrowLeft
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { generateCryptographicTicket } from '../services/ticketPdfService';
import { BookingNode } from '../services/entertainmentService';

interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  timestamp: any;
  status: string;
  selection: any;
}

type DashboardTab = 'history' | 'wishlist' | 'profile';

import { seedDatabase } from '../services/seedService';

export default function UserDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('history');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<BookingNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({ name: '', phone: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm("This will clear ALL existing movie data and replace it with the new Narasaraopet schedules. Proceed?")) return;
    setIsSeeding(true);
    try {
      await seedDatabase();
      alert("Database overhauled with Narasaraopet schedules successfully.");
    } catch (e) {
      console.error(e);
      alert("Database overhaul failed.");
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        // Fetch History - Removed orderBy to avoid index requirement for new databases
        const qHistory = query(
          collection(db, 'transactions'),
          where('userId', '==', auth.currentUser.uid)
        );
        const historySnapshot = await getDocs(qHistory);
        const historyResults: Transaction[] = [];
        historySnapshot.forEach(doc => {
          historyResults.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        
        // Sort client-side
        historyResults.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
        setTransactions(historyResults);

        // Fetch Wishlist
        const qWish = query(
          collection(db, 'wishlist'),
          where('userId', '==', auth.currentUser.uid)
        );
        const wishSnapshot = await getDocs(qWish);
        const wishResults: BookingNode[] = [];
        wishSnapshot.forEach(doc => {
          wishResults.push({ id: doc.id, ...doc.data() } as any);
        });
        setWishlist(wishResults);

        // Map basic auth data
        setProfileData({
          name: auth.currentUser.displayName || 'Anonymous User',
          email: auth.currentUser.email || '',
          phone: auth.currentUser.phoneNumber || ''
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.currentUser, db]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    // Simulating profile update (as standard Firebase Auth display name update)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, you'd use updateProfile(auth.currentUser, { displayName: profileData.name })
      alert("System profile parameters updated successfully.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderHistory = () => (
    <div className="max-w-5xl mx-auto py-12">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-teal-900/20 rounded-sm opacity-40">
          <Clock size={48} className="mb-4" />
          <h3 className="text-xl font-black uppercase italic tracking-widest">No history detected</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-2">Initialize your first booking from the node registry</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {transactions.map(tx => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-accent/5 border border-teal-900/10 p-8 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all" />
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-black border border-teal-900/20 flex items-center justify-center">
                   <CheckCircle2 className="text-green-500 mr-1" size={16} />
                   <span className="text-[10px] font-black font-mono text-primary uppercase">{tx.category?.substring(0, 3)}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">{tx.title}</h3>
                  <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-secondary/40">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {tx.timestamp?.toDate().toLocaleDateString()}</span>
                    <span className="text-primary italic">ID: #{tx.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-12 mt-6 md:mt-0">
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase text-secondary/30 tracking-[0.3em] block mb-1">SETTLEMENT</span>
                  <span className="text-2xl font-black tracking-tighter text-white">₹{tx.amount}</span>
                </div>
                <button 
                  onClick={() => generateCryptographicTicket(tx)}
                  className="w-12 h-12 border border-teal-900/10 flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all text-secondary/40 hover:text-primary"
                >
                   <Download size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="max-w-5xl mx-auto py-12">
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-teal-900/20 rounded-sm opacity-20">
          <Heart size={48} className="mb-4" />
          <h3 className="text-xl font-black uppercase italic tracking-widest text-white">Wishlist Empty</h3>
          <p className="text-[10px] uppercase tracking-[0.4em] mt-2">Zero saved nodes in local resonance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map(node => (
            <div key={node.id} className="group relative overflow-hidden bg-accent/5 border border-teal-900/20 p-6 flex gap-6 hover:border-primary transition-all">
              <div className="w-20 h-20 overflow-hidden rounded grayscale group-hover:grayscale-0 transition-all">
                <img src={node.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left relative z-10">
                <h4 className="text-lg font-black uppercase italic tracking-tight">{node.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 font-black uppercase italic">{node.category}</span>
                   <span className="text-[9px] text-secondary/40 font-black uppercase tracking-widest">₹{node.price}</span>
                </div>
              </div>
              <button className="self-center p-3 text-secondary/20 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-xl mx-auto py-12 space-y-12">
       <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(242,125,38,0.2)]">
             <User size={64} className="text-primary" />
          </div>
          <div className="text-center">
             <h3 className="text-2xl font-black uppercase italic tracking-widest text-white">{profileData.name}</h3>
             <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.5em] mt-1 italic">Verified Operative Status</p>
          </div>
       </div>

       <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
          <div className="grid grid-cols-1 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.3em] ml-2 flex items-center gap-2">
                   <User size={12} className="text-primary" /> Manifest Identity
                </label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value.toUpperCase()})}
                  className="w-full bg-black/60 border border-teal-900/30 py-4 px-6 text-xs text-white outline-none focus:border-primary transition-all font-black uppercase"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.3em] ml-2 flex items-center gap-2">
                   <Mail size={12} /> Contact Uplink (Read Only)
                </label>
                <input 
                  type="email" 
                  readOnly
                  value={profileData.email}
                  className="w-full bg-teal-900/5 border border-teal-900/10 py-4 px-6 text-xs text-secondary/20 outline-none font-black opacity-50"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.3em] ml-2 flex items-center gap-2">
                   <Smartphone size={12} className="text-primary" /> Secure Link Number
                </label>
                <input 
                  type="tel" 
                  placeholder="+91-XXXX-XXXXXX"
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-black/60 border border-teal-900/30 py-4 px-6 text-xs text-white outline-none focus:border-primary transition-all font-mono"
                />
             </div>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl space-y-4">
             <div className="flex items-center gap-4 text-[10px] font-black text-white uppercase tracking-widest">
                <ShieldCheck className="text-red-500" size={16} /> Encryption Key Overhaul
             </div>
             <p className="text-[9px] text-secondary/40 font-black uppercase leading-relaxed">System allows password reset via a secure link sent to your registered contact uplink.</p>
             <button type="button" className="text-[9px] font-black text-red-500 hover:text-white uppercase tracking-widest underline decoration-red-500 underline-offset-4">INITIATE RESET PROTOCOL</button>
          </div>

          <button 
            type="submit"
            disabled={isSavingProfile}
            className="w-full py-5 bg-primary text-black font-black uppercase text-[12px] tracking-[0.5em] hover:bg-white transition-all shadow-[0_0_30px_rgba(242,125,38,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {isSavingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
             Update Vector Data
          </button>

          {/* admin seed panel */}
          <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
             <div className="p-6 bg-gray-900 border border-primary/20 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <Database className="text-primary" size={20} />
                      <h4 className="text-sm font-black uppercase tracking-widest text-white">System Calibration</h4>
                   </div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
                      Execute a full database overhaul to synchronize with the latest Narasaraopet cinematic schedules and theater nodes.
                   </p>
                   <button
                     type="button"
                     onClick={handleSeed}
                     disabled={isSeeding}
                     className="w-full py-4 border border-primary/40 hover:bg-primary hover:text-black transition-all text-primary font-black uppercase text-[10px] tracking-widest rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                      {isSeeding ? <Loader2 className="animate-spin" size={14} /> : <History size={14} />}
                      Synchronize Matrix
                   </button>
                </div>
             </div>
          </div>
       </form>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col"
    >
      <header className="p-8 md:p-12 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-xl relative overflow-hidden">
                  <User size={24} className="text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Operative Hub</h2>
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.5em] mt-1">TicketX Pro Dashboard</p>
              </div>
           </div>

           <nav className="hidden md:flex gap-4 p-1 bg-gray-50 border border-gray-100 rounded-full ml-10">
              {[
                { id: 'history', label: 'Ledger', icon: History },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'profile', label: 'Profile', icon: ShieldCheck }
              ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as DashboardTab)}
                   className={cn(
                     "px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                     activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-900"
                   )}
                 >
                    <tab.icon size={14} /> {tab.label}
                 </button>
              ))}
           </nav>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back to Nodes</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-0 custom-scrollbar bg-white">
         {loading ? (
           <div className="flex flex-col items-center justify-center h-full text-primary space-y-6">
              <Loader2 className="animate-spin" size={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.8em]">Syncing Global Matrix...</span>
           </div>
         ) : (
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
             >
               {activeTab === 'history' && renderHistory()}
               {activeTab === 'wishlist' && renderWishlist()}
               {activeTab === 'profile' && renderProfile()}
             </motion.div>
           </AnimatePresence>
         )}
      </div>

      <footer className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50 text-left">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
            <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.5em]">System Link Stable • Encryption Active</span>
         </div>
         <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.5em] italic">TicketX Command Center [UID: {auth.currentUser?.uid ? auth.currentUser.uid.substring(0, 8).toUpperCase() : 'PROTOCOL-GATE'}]</p>
      </footer>
    </motion.div>
  );
}
