import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft,
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !acceptedTerms) {
      setError('You must accept the terms of service to proceed.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      onClose();
    } catch (err: any) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) {
            if (parsed.error.includes('auth/email-already-in-use')) {
              errorMessage = 'This email is already registered. Try logging in.';
            } else if (parsed.error.includes('auth/invalid-credential')) {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (parsed.error.includes('auth/weak-password')) {
              errorMessage = 'Password is too weak. Use at least 6 characters.';
            } else {
              errorMessage = parsed.error;
            }
          }
        } catch {
          if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already in use.';
          else if (err.code === 'auth/invalid-credential') errorMessage = 'Invalid credentials.';
          else errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white text-black rounded-2xl p-8 shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 text-gray-400 hover:text-primary flex items-center gap-2 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join TicketX'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Login to access your bookings and favorites.' : 'Get access to the best entertainment in your city.'}
          </p>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-3 text-xs font-black tracking-widest rounded-md transition-all",
              isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            LOGIN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-3 text-xs font-black tracking-widest rounded-md transition-all",
              !isLogin ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            SIGNUP
          </button>
        </div>

        <button 
          onClick={async () => {
            setIsLoading(true);
            setError('');
            try {
              await loginWithGoogle();
              onClose();
            } catch (err: any) {
              setError(err.message || 'Google authentication failed');
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="w-full h-14 border-2 border-gray-100 hover:border-gray-200 rounded-xl flex items-center justify-center gap-3 transition-all mb-6 group bg-gray-50/50"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-900">
            Secure Entry with Google
          </span>
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em]">
            <span className="bg-white px-4 text-gray-300">Or Manual Override</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Identity</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Wick"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" 
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Comms Protocol (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="operative@ticketx.pro"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Access Key (Password)</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="password" 
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" 
              />
            </div>
            {!isLogin && <p className="text-[9px] text-gray-400 mt-2 px-1">Minimum 6 characters required</p>}
          </div>

          {!isLogin && (
            <div className="flex items-start gap-3 px-1 mt-6">
              <div className="relative flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-[10px] text-gray-500 leading-relaxed cursor-pointer select-none">
                I formally acknowledge and accept the 250 protocols outlined in the{' '}
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/terms');
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Terms of Engagement
                </button>
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 mt-8 group"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>{isLogin ? 'Initialize Session' : 'Register Operative'}</span>
                <ShieldCheck size={18} className="text-primary group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            By continuing, you agree to our <span className="text-primary cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
