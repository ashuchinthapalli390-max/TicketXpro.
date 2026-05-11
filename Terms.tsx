import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Scale, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { title: "Universal Acceptance", start: 1, end: 25 },
  { title: "User Obligations & Protocols", start: 26, end: 75 },
  { title: "Data Synchronization & Privacy", start: 76, end: 125 },
  { title: "Ticketing & Transaction Integrity", start: 126, end: 175 },
  { title: "Governance & Jurisdiction", start: 176, end: 225 },
  { title: "Termination & System Purge", start: 226, end: 250 },
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-dark py-20 transition-colors">
      <div className="max-w-4xl mx-auto px-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-400 hover:text-primary mb-12 uppercase text-[10px] font-black tracking-[0.3em] group transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Abort and Return
        </motion.button>

        <header className="mb-16">
          <div className="status-indicator mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            System Protocol V.1.00
          </div>
          <h1 className="text-cinematic-lg text-gray-900 dark:text-white uppercase leading-none mb-6">
            Terms of <br /><span className="text-primary">Engagement</span>
          </h1>
          <p className="text-gray-500 max-w-xl text-sm leading-relaxed">
            By initializing a session with TicketX, you formally enter into a binding covenant. 
            Failure to comply with any clause below results in immediate session termination.
          </p>
        </header>

        <div className="space-y-12 mb-20">
          {categories.map((cat, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-l-2 border-primary/20 pl-8 relative"
            >
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                {idx === 0 && <Shield size={14} className="text-primary" />}
                {idx === 1 && <Scale size={14} className="text-primary" />}
                {idx === 2 && <ScrollText size={14} className="text-primary" />}
                Sector {idx + 1}: {cat.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {Array.from({ length: cat.end - cat.start + 1 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-[10px] font-mono text-primary/40 shrink-0">
                      [{String(cat.start + i).padStart(3, '0')}]
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Protocol entry regarding {cat.title.toLowerCase()} and the regulation of system interaction point {cat.start + i}. 
                      Users must maintain continuous authentication integrity throughout this phase.
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <footer className="border-t border-gray-100 dark:border-gray-800 pt-12 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Last Synchronized: 2026-05-08 23:14:00Z
          </p>
        </footer>
      </div>
    </div>
  );
}
