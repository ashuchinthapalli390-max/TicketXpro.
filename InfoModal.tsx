import React from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Info } from 'lucide-react';
import { BookingNode } from '../services/entertainmentService';

interface InfoModalProps {
  node: BookingNode;
  onClose: () => void;
  onBook: (node: BookingNode) => void;
}

export default function InfoModal({ node, onClose, onBook }: InfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark border border-teal-900/30 p-8 w-full max-w-lg rounded-2xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary/40 hover:text-primary transition-all flex items-center gap-2 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
        
        <div className="flex items-center gap-2 mb-6 text-primary">
            <Info size={24} />
            <span className="text-sm font-black uppercase tracking-widest italic text-white">Node Details</span>
        </div>

        <img src={node.imageUrl} alt={node.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{node.title}</h2>
        <p className="text-secondary/70 text-sm leading-relaxed mb-6">{node.description || "No description available."}</p>
        
        <div className="space-y-3 text-xs font-black uppercase tracking-widest text-secondary/60">
          <div className="flex items-center gap-3"><MapPin size={16} className="text-primary" /> {node.venue}</div>
          <div className="flex items-center gap-3"><Calendar size={16} className="text-primary" /> {new Date(node.dateTime).toLocaleDateString()} {node.releaseYear && `(${node.releaseYear})`}</div>
          <div className="flex items-center gap-3"><Clock size={16} className="text-primary" /> Duration: {node.metadata?.duration || "N/A"}</div>
          {node.metadata?.director && <div className="flex items-center gap-3"><Info size={16} className="text-primary" /> Director: {node.metadata.director}</div>}
          {node.metadata?.cast && <div className="flex items-center gap-3"><Info size={16} className="text-primary" /> Cast: {node.metadata.cast}</div>}
        </div>

        <button 
          onClick={() => {
            onBook(node);
            onClose();
          }}
          className="w-full mt-8 py-4 bg-primary text-black text-xs font-black uppercase tracking-[0.3em] rounded-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(242,125,38,0.3)]"
        >
          Proceed to Booking
        </button>
      </div>
    </div>
  );
}
