import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface NewsletterProps {
  layout?: 'row' | 'stack';
}

export default function Newsletter({ layout = 'row' }: NewsletterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 ${layout === 'stack' ? 'justify-center' : ''}`}
          >
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">Successfully Subscribed!</span>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className={`flex flex-col ${layout === 'row' ? 'sm:flex-row' : ''} gap-3`}
          >
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address" 
              className={`flex-grow px-5 py-3 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm ${
                layout === 'row' 
                  ? 'bg-white border border-gray-200 focus:ring-primary/10' 
                  : 'bg-gray-800 text-white border-transparent focus:ring-white/10'
              }`}
            />
            <button 
              type="submit" 
              className={`bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg active:scale-95 whitespace-nowrap text-sm`}
            >
              Join
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
