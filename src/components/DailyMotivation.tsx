import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, RefreshCw, CalendarDays, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { getDailyMotivation } from '../services/claude';
import { type Favorite } from '../hooks/useFavorites';

const CACHE_KEY = 'fathom_daily_quote';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

type HistoryQuote = { date: string; quote: string };

type Props = {
  isFavorited: (id: string) => boolean;
  toggleFavorite: (item: Omit<Favorite, 'savedAt'>) => void;
};

export default function DailyMotivation({ isFavorited, toggleFavorite }: Props) {
  const [motivation, setMotivation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDaily, setIsDaily] = useState(true);
  const [quoteId, setQuoteId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryQuote[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      setQuoteId('quote-fallback');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (history.length > 0) return;
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/quotes/history');
      const data = await res.json();
      setHistory(data);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) loadHistory();
  };

  useEffect(() => { fetchMotivation(); }, []);

  const favorited = quoteId ? isFavorited(quoteId) : false;
  const cleanQuote = motivation.replace(/^"|"$/g, '');

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Today's quote card */}
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
                  <Heart size={20} className={favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                </button>
              )}
              <button
                onClick={() => fetchMotivation(true)}
                disabled={loading}
                title="Get a new quote"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
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
                {loading ? 'Gathering wisdom...' : cleanQuote}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* History toggle */}
        <button
          onClick={handleToggleHistory}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mx-auto"
        >
          <CalendarDays size={16} />
          {showHistory ? 'Hide' : 'View'} past quotes — since January 1st
          {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* History list */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {history.map((item, i) => {
                    const hId = `history-${item.date}`;
                    const hFav = isFavorited(hId);
                    const isToday = item.date === getTodayKey();
                    return (
                      <motion.div
                        key={item.date}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        className={`flex items-start gap-4 p-4 rounded-2xl border group ${isToday ? 'border-brand-200 bg-brand-50' : 'border-slate-100 bg-white'}`}
                      >
                        <div className="flex-shrink-0 text-center min-w-[52px]">
                          <div className={`text-xs font-bold uppercase tracking-wide ${isToday ? 'text-brand-600' : 'text-slate-400'}`}>
                            {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className={`text-2xl font-display leading-none ${isToday ? 'text-brand-600' : 'text-slate-700'}`}>
                            {new Date(item.date + 'T00:00:00').getDate()}
                          </div>
                          {isToday && <div className="text-[10px] text-brand-500 font-bold uppercase">Today</div>}
                        </div>
                        <p className="flex-1 text-slate-700 text-sm leading-relaxed pt-1">{item.quote}</p>
                        <button
                          onClick={() => toggleFavorite({ id: hId, type: 'quote', text: item.quote })}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-full transition-all flex-shrink-0 mt-0.5"
                          title={hFav ? 'Remove from saved' : 'Save quote'}
                        >
                          <Heart size={15} className={hFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
