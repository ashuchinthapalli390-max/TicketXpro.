import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-red-500/10 border-2 border-red-500 rounded-2xl p-10 space-y-8 backdrop-blur-xl">
             <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <AlertCircle className="text-red-500" size={40} />
             </div>
             <div className="space-y-4">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">System Breach</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Critical Handshake Failure Detected</p>
                <div className="p-4 bg-black/60 border border-red-500/20 rounded text-left">
                   <p className="text-[10px] font-mono text-red-400 break-all">{this.state.error?.message || 'Unknown protocol violation'}</p>
                </div>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="w-full py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-sm flex items-center justify-center gap-3 hover:bg-white hover:text-red-500 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]"
             >
               <RefreshCcw size={16} /> Force System Reboot
             </button>
             <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">Error code: {Math.random().toString(36).substring(7).toUpperCase()}_CRASH</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
