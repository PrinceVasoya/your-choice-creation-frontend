import { motion } from 'motion/react';
import { Heart, Users, Star, Gift, Clock, Sparkles } from 'lucide-react';

export default function About() {
  const milstones = [
    { year: '2015', title: 'The Beginning', desc: 'Started with a small studio in Mumbai.' },
    { year: '2018', title: 'Expanding Hearts', desc: 'Gifted over 10,000 unique personalized items.' },
    { year: '2021', title: 'Going Digital', desc: 'Launched our online platform to reach India-wide.' },
    { year: '2024', title: 'Top Gifter', desc: 'Recognized as #1 emerging gift brand.' },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://picsum.photos/seed/about/1920/1080" alt="About" className="w-full h-full object-cover brightness-50" />
        </div>
        <div className="relative z-10 space-y-6 max-w-3xl">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent uppercase tracking-widest font-bold">Our Story</motion.span>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl sm:text-7xl font-serif font-bold text-white"
          >
            Crafting Emotions, <br /> One Gift at a Time
          </motion.h1>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight">
            We believe that every gift <br /> should carry a piece of <span className="text-primary italic">Soul</span>.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            YourChoice Creation was born out of a simple realization: the best gifts aren't the most expensive ones, but those that show deep thoughtfulness. Since 2015, we've been on a mission to turn common items into cherished memories.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-2 border-l-4 border-accent pl-6">
              <h4 className="text-3xl font-bold text-gray-900">50K+</h4>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Happy Customers</p>
            </div>
            <div className="space-y-2 border-l-4 border-accent pl-6">
              <h4 className="text-3xl font-bold text-gray-900">98%</h4>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Satisfaction Rate</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <img src="https://picsum.photos/seed/crew/800/600" alt="Our Crew" className="rounded-3xl shadow-2xl relative z-10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary rounded-3xl -z-10" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent rounded-full -z-10 blur-3xl opacity-30" />
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/50 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Heart size={32} />, title: 'Quality with Love', desc: 'We treat every order like our own. No compromises on material or printing quality.' },
            { icon: <Sparkles size={32} />, title: 'Unique Designs', desc: 'Our designers are always sketching new ways to make your gifts stand out.' },
            { icon: <Users size={32} />, title: 'Customer First', desc: 'Support that actually cares. We are here to help you make your surprise perfect.' },
          ].map((v, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm space-y-6 text-center hover:shadow-xl transition-all cursor-default group">
              <div className="w-20 h-20 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {v.icon}
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-serif font-bold text-gray-900">Our Journey</h2>
          <p className="text-gray-500">The milestones that shaped Your Choice Creation.</p>
        </div>
        <div className="relative flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="absolute top-10 left-0 right-0 h-1 bg-accent/20 hidden md:block" />
          {milstones.map((m, i) => (
            <div key={i} className="relative z-10 space-y-4 md:flex-1 text-center md:text-left">
              <div className="w-12 h-12 bg-accent rounded-full border-4 border-white shadow-lg mx-auto md:mx-0 flex items-center justify-center text-white font-bold text-sm">
                {m.year}
              </div>
              <h4 className="text-xl font-serif font-bold text-gray-900">{m.title}</h4>
              <p className="text-gray-500 text-sm">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team CTA */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
          <img src="https://picsum.photos/seed/background/1920/1080" className="absolute inset-0 object-cover opacity-20" />
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-serif font-bold text-white italic">"There is no gift <br /> like the gift of happiness."</h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
            <p className="text-gray-400">Join our newsletter to become part of our journey.</p>
            <button className="bg-white text-primary px-10 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all">
              Join Our Tribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
