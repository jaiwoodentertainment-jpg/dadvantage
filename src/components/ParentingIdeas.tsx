import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CATEGORIES, STATIC_IDEAS } from '../constants';
import { getDadTip } from '../services/claude';
import { Sparkles, ArrowRight, Loader2, Heart } from 'lucide-react';
import { type Favorite } from '../hooks/useFavorites';

type Props = {
  isFavorited: (id: string) => boolean;
  toggleFavorite: (item: Omit<Favorite, 'savedAt'>) => void;
};

export default function ParentingIdeas({ isFavorited, toggleFavorite }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiTipId, setAiTipId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    setAiTip(null);
    try {
      const tip = await getDadTip(categoryName);
      setAiTip(tip || null);
      setAiTipId(`tip-${categoryName}-${Date.now()}`);
    } catch {
      setAiTip("Focus on the small moments today. They add up to a lifetime of love.");
      setAiTipId(`tip-${categoryName}-fallback`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Parenting Playbook</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Choose a focus area and let AI generate a fresh perspective or practical idea for you to try today.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedCategory === cat.name
                  ? 'border-brand-500 bg-brand-50 shadow-lg scale-105'
                  : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-3 rounded-xl ${cat.color} text-white mb-3`}>
                <cat.icon size={24} />
              </div>
              <span className="text-sm font-bold text-slate-800 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-3xl p-8 md:p-12 border-brand-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-brand-600 font-bold">
                  <Sparkles size={20} />
                  <span>DadVantage AI: {selectedCategory}</span>
                </div>
                {!loading && aiTip && (
                  <button
                    onClick={() => toggleFavorite({
                      id: aiTipId,
                      type: 'tip',
                      text: aiTip,
                      category: selectedCategory,
                    })}
                    title={isFavorited(aiTipId) ? 'Remove from saved' : 'Save tip'}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <Heart
                      size={20}
                      className={isFavorited(aiTipId) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
                    />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
                  <p className="text-slate-500 font-medium italic">Thinking of something great for you...</p>
                </div>
              ) : (
                <div className="markdown-body">
                  <Markdown>{aiTip}</Markdown>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedCategory && (
          <div className="grid md:grid-cols-3 gap-8">
            {STATIC_IDEAS.map((idea, idx) => {
              const id = `idea-${idx}`;
              const favorited = isFavorited(id);
              return (
                <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow relative group">
                  <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">{idea.category}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{idea.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{idea.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-900 font-semibold text-sm group cursor-pointer">
                      Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <button
                      onClick={() => toggleFavorite({ id, type: 'idea', text: idea.description, title: idea.title, category: idea.category })}
                      title={favorited ? 'Remove from saved' : 'Save idea'}
                      className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                      <Heart
                        size={18}
                        className={favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-slate-400'}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
