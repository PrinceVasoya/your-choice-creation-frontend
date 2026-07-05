import { Truck, Clock, MapPin, ShieldCheck, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Shipping() {
  return (
    <div className="bg-white min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-24">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px]">Logistics & Delivery</span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 tracking-tight">Shipping Policy</h1>
          <p className="text-gray-500 font-sans max-w-xl mx-auto">We take immense care in delivering your emotions across distances.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
             <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-gray-900">How We Deliver</h2>
                <p className="text-gray-500 leading-relaxed">At <span className="text-primary font-bold">YourChoice Creation</span>, we partner with premium logistics providers and local florists to ensure your gifts reach their destination fresh and on time.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                {[
                  { icon: <Zap />, title: "Same Day Delivery", desc: "Available for cakes and flowers in prime cities if ordered by 12 PM." },
                  { icon: <Clock />, title: "Standard Delivery", desc: "3-5 business days for personalized non-perishable items." },
                  { icon: <Globe />, title: "Pan India Presence", desc: "We deliver to over 15,000+ pin codes across the country." },
                  { icon: <ShieldCheck />, title: "Fragile Handling", desc: "Special packaging for frames and delicate ceramic items." }
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                     <div className="w-12 h-12 bg-secondary text-primary rounded-2xl flex items-center justify-center shadow-sm">
                        {item.icon}
                     </div>
                     <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{item.title}</h4>
                     <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="relative">
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="bg-secondary rounded-[3rem] p-12 lg:p-20 space-y-8"
             >
                <div className="space-y-2">
                   <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">Hand-Delivery Network</h3>
                   <p className="text-gray-500 text-sm">Gifts like cakes and flowers are hand-delivered by our specialized fleet to maintain freshness.</p>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <MapPin size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Live Tracking</p>
                         <p className="text-sm font-bold text-gray-900">Real-time SMS updates from pick-up to delivery.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <Truck size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Standard Shipping</p>
                         <p className="text-sm font-bold text-gray-900">Free shipping on all personalized orders.</p>
                      </div>
                   </div>
                </div>
             </motion.div>
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
          </div>
        </div>

        <div className="mt-40 p-12 bg-gray-900 rounded-[3rem] text-center text-white space-y-8 overflow-hidden relative">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
           </div>
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold italic">Special Request?</h2>
              <p className="text-gray-400 text-lg">Need a surprise delivery at midnight or specific timing for a proposal? Our team is happy to accommodate custom logistics when possible.</p>
              <button className="bg-primary text-white px-10 py-5 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl">Contact Concierge</button>
           </div>
        </div>
      </div>
    </div>
  );
}
