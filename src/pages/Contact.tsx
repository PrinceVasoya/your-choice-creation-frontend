import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useState, FormEvent } from 'react';

export default function Contact() {
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };
  return (
    <div className="bg-secondary/30 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-xs"
          >
            Get In Touch
          </motion.span>
          <h1 className="text-5xl sm:text-7xl font-serif font-bold text-gray-900">
            Let's <span className="italic text-primary">Chat</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Have questions about a custom order? Need help choosing the right gift? We are here to help you make your surprise perfect.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            {[
              { icon: <Mail className="text-primary" />, title: 'Email Us', info: 'hello@yourchoice.com', sub: 'We respond within 24 hours' },
              { icon: <Phone className="text-primary" />, title: 'Call Us', info: '+91 98765 43210', sub: 'Mon-Sat, 10am to 7pm' },
              { icon: <MapPin className="text-primary" />, title: 'Visit Us', info: 'Studio 102, Design Park', sub: 'Andheri West, Mumbai, 400053' },
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-6 group hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-secondary rounded-2xl group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">{card.title}</h3>
                  <p className="text-lg font-serif font-bold text-primary">{card.info}</p>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{card.sub}</p>
                </div>
              </motion.div>
            ))}
            
            <div className="bg-gray-900 text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
               <Clock className="text-accent absolute -bottom-6 -right-6 opacity-20" size={120} />
               <div className="space-y-2">
                 <h4 className="text-accent font-serif font-bold text-xl uppercase tracking-widest">Business Hours</h4>
                 <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between"><span>Mon - Fri</span><span>10:00 - 19:00</span></div>
                    <div className="flex justify-between font-bold text-gray-300"><span>Sat - Sun</span><span>11:00 - 18:00</span></div>
                 </div>
               </div>
               <p className="text-xs italic text-gray-500">*Cakes and floral orders accepted 24/7 online for next day delivery.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {isSent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-grow flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-gray-900">Message Received!</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">We've received your inquiry and will get back to you within 1 business day.</p>
                  </div>
                  <button 
                    onClick={() => setIsSent(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <div className="flex items-center space-x-3 mb-10 text-primary">
                    <MessageSquare size={24} />
                    <h2 className="text-2xl font-serif font-bold">Write Your Message</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full px-6 py-4 rounded-xl bg-secondary border border-transparent focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input required type="email" placeholder="john@example.com" className="w-full px-6 py-4 rounded-xl bg-secondary border border-transparent focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                      <select className="w-full px-6 py-4 rounded-xl bg-secondary border border-transparent focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none appearance-none">
                        <option>Order Inquiry</option>
                        <option>Custom Modification Request</option>
                        <option>Bulk / Corporate Orders</option>
                        <option>Feedback</option>
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea required rows={6} placeholder="Tell us what's on your mind..." className="w-full px-6 py-4 rounded-xl bg-secondary border border-transparent focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none resize-none"></textarea>
                    </div>
                    
                    <div className="sm:col-span-2 pt-4">
                      <button type="submit" className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                        <Send size={20} />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Map Placeholder */}
      <div className="max-w-7xl mx-auto px-4 mt-24">
        <div className="h-[400px] bg-secondary rounded-[3rem] overflow-hidden relative group">
          <img src="https://picsum.photos/seed/map/1500/800" alt="Map" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-4 bg-white rounded-full shadow-2xl relative">
              <div className="absolute inset-0 bg-primary animate-ping rounded-full" />
              <MapPin className="text-primary relative z-10" size={32} fill="currentColor" fillOpacity={0.2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
