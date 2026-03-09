import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { CATEGORIES, STATIC_IDEAS } from '../constants';
import { generateDadTip } from '../services/gemini';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function ParentingIdeas() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setLoading(true);
    try {
      const tip = await generateDadTip(categoryName);
      setAiTip(tip || null);
    } catch (error) {
      setAiTip("Focus on the small moments today. They add up to a lifetime of love.");
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
              <div className="flex items-center gap-2 text-brand-600 font-bold mb-6">
                <Sparkles size={20} />
                <span>DadVantage AI: {selectedCategory}</span>
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
            {STATIC_IDEAS.map((idea, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">{idea.category}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{idea.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{idea.description}</p>
                <div className="flex items-center text-slate-900 font-semibold text-sm group cursor-pointer">
                  Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
