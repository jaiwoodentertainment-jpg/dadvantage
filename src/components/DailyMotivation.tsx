import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, RefreshCw } from 'lucide-react';
import { generateDailyMotivation } from '../services/gemini';

export default function DailyMotivation() {
  const [motivation, setMotivation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const text = await generateDailyMotivation();
      setMotivation(text || "You're doing better than you think. Keep going, Dad.");
    } catch (error) {
      setMotivation("Your presence is the greatest gift you can give your children.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-500" />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-brand-600 font-semibold uppercase tracking-wider text-sm">
              <Quote size={18} />
              Daily Fuel
            </div>
            <button 
              onClick={fetchMotivation}
              disabled={loading}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={motivation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[100px] flex items-center"
            >
              <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-900 leading-tight">
                {loading ? "Gathering wisdom..." : motivation.replace(/^"|"$/g, '')}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
