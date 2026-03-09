import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Quote, Sparkles, Lightbulb, BookmarkX } from 'lucide-react';
import { type Favorite } from '../hooks/useFavorites';

type Props = {
  open: boolean;
  onClose: () => void;
  favorites: Favorite[];
  onRemove: (id: string) => void;
};

const typeIcon = {
  quote: <Quote size={14} />,
  tip: <Sparkles size={14} />,
  idea: <Lightbulb size={14} />,
};

const typeLabel = {
  quote: 'Daily Quote',
  tip: 'AI Tip',
  idea: 'Idea',
};

export default function FavoritesDrawer({ open, onClose, favorites, onRemove }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-slate-900">Saved</h2>
                <p className="text-xs text-slate-400 mt-0.5">{favorites.length} item{favorites.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
                  <BookmarkX size={40} strokeWidth={1.5} />
                  <p className="text-sm">Nothing saved yet.<br />Tap the heart on any quote or tip.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {favorites.map(fav => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group"
                    >
                      <div className="flex items-center gap-1.5 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        {typeIcon[fav.type]}
                        {fav.category ? `${typeLabel[fav.type]} · ${fav.category}` : typeLabel[fav.type]}
                      </div>
                      {fav.title && (
                        <p className="font-bold text-slate-900 text-sm mb-1">{fav.title}</p>
                      )}
                      <p className="text-slate-700 text-sm leading-relaxed line-clamp-4">{fav.text}</p>
                      <button
                        onClick={() => onRemove(fav.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
