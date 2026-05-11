import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: "Hello! I'm your TicketX Pro assistant. How can I help you book your next adventure today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: "You are the AI Assistant for TicketX Pro, a unified booking platform for Flights, Trains, Buses, Movies, Concerts, Hotels, and Venues. Be helpful, professional, and cinematic in your tone. Answer questions about bookings, seat availability, and generic platform policies."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Our data streams are currently flickering. Please try again soon." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="glass mb-4 w-80 h-[500px] rounded-2xl overflow-hidden shadow-2xl border-primary/20 flex flex-col"
          >
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white" />
                <div className="font-medium text-white tracking-tight">AI Concierge</div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                 <X size={18} />
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                    m.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none border border-white/5">
                      <Loader2 size={16} className="animate-spin text-primary" />
                   </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="bg-primary p-2 rounded-xl text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-br from-primary to-orange-600 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.5)] active:scale-90 transition-all group"
      >
        <div className="relative">
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-orange-600"></span>
          <MessageCircle size={24} className="text-dark group-hover:rotate-12 transition-transform" />
        </div>
      </button>
    </div>
  );
}
