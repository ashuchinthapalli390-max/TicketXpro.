import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TEAM_DYNAMIC } from '../constants';
import { Github, Youtube, Instagram, MessageCircle, Database, Check } from 'lucide-react';
import { seedDatabase } from '../services/seedService';

export default function AboutSection() {
  const [seeding, setSeeding] = useState(false);
  const [seedComplete, setSeedComplete] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      setSeedComplete(true);
      setTimeout(() => setSeedComplete(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section className="py-24 bg-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cinematic-xl font-black text-secondary/5 tracking-tighter uppercase whitespace-nowrap pointer-events-none select-none font-accent">
        ARCHITECTS
      </div>
      
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-cinematic-lg leading-none"
            >
              OUR <span className="text-stroke">DEVELOPERS</span>
            </motion.h2>
            <p className="text-secondary/40 max-w-xl mt-4 tracking-[0.4em] uppercase text-[10px] font-bold font-mono">
              TEAM DYNAMIC • Visionary engineering.
            </p>
          </div>

          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-3 px-6 py-3 bg-secondary/5 border border-secondary/10 text-secondary/40 hover:text-primary hover:border-primary transition-all rounded-lg text-xs font-black uppercase tracking-widest"
          >
            {seeding ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : seedComplete ? (
              <Check className="text-green-500" size={16} />
            ) : (
              <Database size={16} />
            )}
            {seeding ? 'Syncing...' : seedComplete ? 'Nodes Synced' : 'Sync Regional Nodes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {TEAM_DYNAMIC.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-accent/5 border border-teal-900/20 p-8 rounded-sm h-full flex flex-col items-center text-center transition-all duration-700 group-hover:border-primary/50 group-hover:bg-primary/5 overflow-hidden">
                {/* Text-based identity block */}
                <div className="relative mb-12 flex items-center justify-center h-32 w-full">
                   <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   <span className="text-7xl font-display font-black text-secondary/5 group-hover:text-primary transition-all duration-700 select-none group-hover:scale-110">
                     {member.name ? member.name.charAt(0) : 'T'}
                   </span>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-700" />
                </div>

                <h3 className="text-2xl font-bold uppercase tracking-tight mb-1 leading-none group-hover:text-primary transition-colors duration-500">{member.name}</h3>
                <p className="text-primary text-[9px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-primary/20 pb-2">{member.role}</p>
                <p className="text-secondary/50 text-[11px] leading-relaxed mb-8 flex-1 font-medium font-mono uppercase tracking-wider">{member.bio}</p>
                
                <div className="flex gap-4 pt-6 w-full justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {member.socials?.instagram && (
                    <motion.a 
                      href={member.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="text-secondary/30 hover:text-pink-500 transition-colors"
                    >
                      <Instagram size={18} />
                    </motion.a>
                  )}
                  {member.socials?.whatsapp && (
                    <motion.a 
                      href={member.socials.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="text-secondary/30 hover:text-green-500 transition-colors"
                    >
                      <MessageCircle size={18} />
                    </motion.a>
                  )}
                  {member.socials?.youtube && (
                    <motion.a 
                      href={member.socials.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="text-secondary/30 hover:text-red-500 transition-colors"
                    >
                      <Youtube size={18} />
                    </motion.a>
                  )}
                  {member.socials?.github && (
                    <motion.a 
                      href={member.socials.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="text-secondary/30 hover:text-white transition-colors"
                    >
                      <Github size={18} />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
