import React from 'react';
import { motion } from 'motion/react';
import { UserCheck, Zap, Trophy } from 'lucide-react';

export default function Hero() {
  return (
    <header className="relative pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">The Modern Father's Hub</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display text-slate-900 mb-6 leading-none"
          >
            Level Up Your <br />
            <span className="text-brand-600">Dad Game.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
          >
            Parenting is the ultimate endurance sport. Get the motivation, ideas, and support you need to be the hero your kids already think you are.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
              Explore Ideas
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 md:gap-16 border-t border-slate-100 pt-12 w-full max-w-3xl"
          >
            <div className="flex flex-col items-center">
              <div className="text-brand-600 mb-2"><UserCheck size={24} /></div>
              <div className="text-2xl font-bold text-slate-900">5k+</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Dads</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-brand-600 mb-2"><Zap size={24} /></div>
              <div className="text-2xl font-bold text-slate-900">1.2k</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Daily Tips</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-brand-600 mb-2"><Trophy size={24} /></div>
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Commitment</div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
