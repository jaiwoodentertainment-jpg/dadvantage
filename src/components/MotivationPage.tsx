import React from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import DailyMotivation from './DailyMotivation';
import ParentingIdeas from './ParentingIdeas';
import { type Favorite } from '../hooks/useFavorites';

type Props = {
  isFavorited: (id: string) => boolean;
  toggleFavorite: (item: Omit<Favorite, 'savedAt'>) => void;
};

export default function MotivationPage({ isFavorited, toggleFavorite }: Props) {
  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <div className="px-4 max-w-6xl mx-auto mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-5"
        >
          <Flame size={14} className="text-brand-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Daily Fuel</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-display text-slate-900 mb-3"
        >
          Motivation
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 text-lg max-w-xl"
        >
          A daily quote to keep you grounded, plus AI-powered tips for every parenting challenge you're facing.
        </motion.p>
      </div>

      <DailyMotivation isFavorited={isFavorited} toggleFavorite={toggleFavorite} />
      <ParentingIdeas isFavorited={isFavorited} toggleFavorite={toggleFavorite} />
    </div>
  );
}
