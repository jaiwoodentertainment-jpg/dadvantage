import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, RefreshCw, CalendarDays, Heart } from 'lucide-react';
import { getDailyMotivation } from '../services/claude';
import { type Favorite } from '../hooks/useFavorites';

const CACHE_KEY = 'fathom_daily_quote';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  isFavorited: (id: string) => boolean;
  toggleFavorite: (item: Omit<Favorite, 'savedAt'>) => void;
};

export default function DailyMotivation({ isFavorited, toggleFavorite }: Props) {
  const [motivation, setMotivation] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isDaily, setIsDaily] = useState(true);
  const [quoteId, setQuoteId] = useState<string>('');

  const fetchMotivation = async (forceNew = false) => {
    setLoading(true);

    if (!forceNew) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { date, quote, id } = JSON.parse(cached);
        if (date === getTodayKey()) {
          setMotivation(quote);
          setQuoteId(id);
          setIsDaily(true);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const text = await getDailyMotivation();
      const quote = text || "You're doing better than you think. Keep going, Dad.";
      const id = `quote-${Date.now()}`;
      if (!forceNew) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: getTodayKey(), quote, id }));
        setIsDaily(true);
      } else {
        setIsDaily(false);
      }
      setMotivation(quote);
      setQuoteId(id);
    } catch {
      setMotivation("Your presence is the greatest gift you can give your children.");
      setQuoteId(`quote-fallback`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  const favorited = quoteId ? isFavorited(quoteId) : false;
  const cleanQuote = motivation.replace(/^"|"$/g, '');

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-500" />

          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-brand-600 font-semibold uppercase tracking-wider text-sm">
                <Quote size={18} />
                Daily Fuel
              </div>
              {isDaily && !loading && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays size={12} />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!loading && (
                <button
                  onClick={() => toggleFavorite({ id: quoteId, type: 'quote', text: cleanQuote })}
                  title={favorited ? 'Remove from saved' : 'Save quote'}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Heart
                    size={20}
                    className={favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                  />
                </button>
              )}
              <button
                onClick={() => fetchMotivation(true)}
                disabled={loading}
                title="Get a new quote"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={motivation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[100px] flex items-center"
            >
              <h2 className="text-2xl md:text-4xl font-display text-slate-900 leading-tight">
                {loading ? "Gathering wisdom..." : cleanQuote}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
