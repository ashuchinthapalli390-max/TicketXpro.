import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation as NavigationIcon } from 'lucide-react';

interface UnifiedMapProps {
  center: { lat: number; lng: number };
  points: { id: string; title: string; lat: number; lng: number; description?: string }[];
  onClose?: () => void;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export default function UnifiedMap({ center, points, onClose }: UnifiedMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!API_KEY) {
     return (
       <div className="bg-dark/80 backdrop-blur-xl p-8 rounded-sm border border-teal-900/30 text-center">
         <p className="text-primary font-bold uppercase tracking-widest text-xs">Maps Integration Required</p>
         <p className="text-secondary/40 text-[10px] mt-2">Provide GOOGLE_MAPS_PLATFORM_KEY in Secrets</p>
       </div>
     );
  }

  return (
    <div className="relative w-full h-[600px] bg-dark rounded-sm overflow-hidden border border-teal-900/40">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-dark/80 p-2 rounded-sm text-secondary hover:text-white border border-teal-900/30"
        >
          <X size={20} />
        </button>
      )}

      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="TICKETX_DARK_MAP"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {points.map(point => (
            <MarkerWithInfo 
              key={point.id} 
              position={{ lat: point.lat, lng: point.lng }} 
              title={point.title} 
              onSelect={() => setSelectedId(point.id)}
            />
          ))}
        </Map>
      </APIProvider>

      {/* Floating UI Elements over Map */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <div className="bg-dark/90 backdrop-blur-md p-4 border border-teal-900/40 rounded-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Sync Active</span>
          </div>
          <p className="text-secondary/40 text-[9px] uppercase font-bold tracking-tight">Real-time GPS tracking enabled for this sector</p>
        </div>
      </div>
    </div>
  );
}

function MarkerWithInfo({ position, title, onSelect }: { position: { lat: number; lng: number }; title: string; onSelect: () => void }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => {
          setShowInfo(true);
          onSelect();
        }}
      >
        <div className="group relative cursor-pointer">
          <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-8 h-8 bg-black border-2 border-primary rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(242,125,38,0.5)] transition-transform group-hover:rotate-0">
             <NavigationIcon size={14} className="text-primary -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
        </div>
      </AdvancedMarker>

      {showInfo && (
        <InfoWindow anchor={marker} onCloseClick={() => setShowInfo(false)}>
          <div className="p-3 bg-dark min-w-[150px]">
             <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">{title}</p>
             <p className="text-[9px] text-secondary lowercase">Secure node endpoint</p>
             <button className="mt-3 w-full bg-primary text-black py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors">
               Initialize Route
             </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
