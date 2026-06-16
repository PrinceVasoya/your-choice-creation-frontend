import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

interface AdminLoginProps {
  onLogin: (status: boolean) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  usePageTitle('Staff Login — Your Choice Creation Admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Dummy Admin Credentials
    if (username === 'admin' && password === 'admin123') {
      onLogin(true);
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Admin Gate</h2>
            <p className="text-gray-400 text-sm">Secure access for staff only</p>
          </div>
        </div>

        <form onSubmit={handleAdminSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <User size={12} className="text-primary" />
              <span>Username</span>
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Lock size={12} className="text-primary" />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123" 
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Enter Dashboard</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-6 border-t border-gray-50 text-center">
          <button onClick={() => window.history.back()} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
            Back to Public Site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
