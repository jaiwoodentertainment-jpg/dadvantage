import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Hammer, ChefHat, TreePine, Palette, FlaskConical, Trophy, Sparkles, Loader2, Heart, RotateCcw } from 'lucide-react';
import { getWeekendIdea } from '../services/claude';
import { type Favorite } from '../hooks/useFavorites';

const IDEA_CATEGORIES = [
  {
    id: 'building',
    name: 'Building & DIY',
    icon: Hammer,
    color: 'bg-amber-500',
    description: 'Construct something awesome together',
    examples: ['Birdhouse', 'Bookshelf', 'Toy chest', 'Treehouse'],
  },
  {
    id: 'cooking',
    name: 'Cooking & Baking',
    icon: ChefHat,
    color: 'bg-rose-500',
    description: 'Create delicious memories in the kitchen',
    examples: ['Homemade pizza', 'Pancake art', 'Cookie decorating', 'BBQ from scratch'],
  },
  {
    id: 'outdoor',
    name: 'Outdoor Adventures',
    icon: TreePine,
    color: 'bg-emerald-500',
    description: 'Explore the great outdoors together',
    examples: ['Backyard camping', 'Garden project', 'Nature scavenger hunt', 'Obstacle course'],
  },
  {
    id: 'arts',
    name: 'Arts & Crafts',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'Get creative and make something to keep',
    examples: ['Photo scrapbook', 'Painted rocks', 'Clay sculptures', 'Comic book'],
  },
  {
    id: 'science',
    name: 'Science & Learning',
    icon: FlaskConical,
    color: 'bg-blue-500',
    description: 'Blow their minds with fun experiments',
    examples: ['Volcano eruption', 'Stargazing night', 'Grow a garden', 'Paper rockets'],
  },
  {
    id: 'sports',
    name: 'Sports & Games',
    icon: Trophy,
    color: 'bg-orange-500',
    description: 'Get active and have a blast',
    examples: ['Backyard Olympics', 'Mini golf course', 'Family tournament', 'Go-kart race'],
  },
];

const FEATURED_IDEAS = [
  {
    id: 'featured-1',
    category: 'Building & DIY',
    title: 'The Classic Birdhouse',
    difficulty: 'Easy',
    age: '5+',
    time: '2–3 hrs',
    description: 'Grab some wood planks, nails, and paint. Build a simple birdhouse together, then hang it in the backyard and watch birds move in over the coming weeks.',
    materials: ['Wood planks', 'Hammer & nails', 'Paint & brushes', 'Drill (dad handles this)'],
  },
  {
    id: 'featured-2',
    category: 'Cooking & Baking',
    title: 'Homemade Pizza Night',
    difficulty: 'Easy',
    age: '3+',
    time: '1–2 hrs',
    description: 'Make dough from scratch, then set up a topping station and let the kids design their own pizza. Everyone eats what they built.',
    materials: ['Flour, yeast, salt', 'Tomato sauce', 'Cheese & toppings', 'Rolling pin'],
  },
  {
    id: 'featured-3',
    category: 'Outdoor Adventures',
    title: 'Backyard Camping Night',
    difficulty: 'Medium',
    age: '4+',
    time: 'Full evening',
    description: 'Pitch a tent in the backyard, make a fire pit with s\'mores, tell stories, and stargaze. No Wi-Fi. Just dad and the kids.',
    materials: ['Tent', 'Sleeping bags', 'Marshmallows', 'Torch & star map'],
  },
  {
    id: 'featured-4',
    category: 'Arts & Crafts',
    title: 'Family Photo Comic Book',
    difficulty: 'Easy',
    age: '6+',
    time: '2–4 hrs',
    description: 'Print out family photos and turn them into a comic book adventure. Kids write the dialogue and captions. Dad helps assemble and bind it.',
    materials: ['Printed photos', 'Blank comic panels (printed)', 'Markers', 'Stapler or binding'],
  },
  {
    id: 'featured-5',
    category: 'Science & Learning',
    title: 'Backyard Rocket Launch',
    difficulty: 'Medium',
    age: '6+',
    time: '2–3 hrs',
    description: 'Build paper rockets with card stock and tape, then use a bike pump launcher. Measure distances and have a competition.',
    materials: ['Card stock', 'Tape & scissors', 'Bike pump', 'Tape measure'],
  },
  {
    id: 'featured-6',
    category: 'Sports & Games',
    title: 'Dad\'s Backyard Olympics',
    difficulty: 'Easy',
    age: '4+',
    time: '2–3 hrs',
    description: 'Design 5 events — sack race, water balloon throw, hula hoop, long jump, sprint. Make medals from cardboard and crown a champion.',
    materials: ['Sacks / pillowcases', 'Water balloons', 'Hula hoops', 'Cardboard medals'],
  },
];

const difficultyColor: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-rose-100 text-rose-700',
};

type Props = {
  isFavorited: (id: string) => boolean;
  toggleFavorite: (item: Omit<Favorite, 'savedAt'>) => void;
};

export default function IdeasPage({ isFavorited, toggleFavorite }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiIdea, setAiIdea] = useState<string | null>(null);
  const [aiIdeaId, setAiIdeaId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (categoryName: string) => {
    if (selectedCategory === categoryName && aiIdea) return;
    setSelectedCategory(categoryName);
    setAiIdea(null);
    setLoading(true);
    try {
      const idea = await getWeekendIdea(categoryName);
      setAiIdea(idea || null);
      setAiIdeaId(`weekend-${categoryName}-${Date.now()}`);
    } catch {
      setAiIdea("Couldn't load an idea right now. Try again!");
      setAiIdeaId(`weekend-${categoryName}-fallback`);
    } finally {
      setLoading(false);
    }
  };

  const refreshIdea = async () => {
    if (!selectedCategory) return;
    setAiIdea(null);
    setLoading(true);
    try {
      const idea = await getWeekendIdea(selectedCategory);
      setAiIdea(idea || null);
      setAiIdeaId(`weekend-${selectedCategory}-${Date.now()}`);
    } catch {
      setAiIdea("Couldn't load an idea right now. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6"
        >
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Weekend Mode</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-display text-slate-900 mb-4"
        >
          Weekend Project Ideas
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          From building things to baking together — pick a category and get a fresh AI-generated idea, or browse our featured projects below.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Category Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {IDEA_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                selectedCategory === cat.name
                  ? 'border-brand-500 bg-brand-50 shadow-lg scale-105'
                  : 'border-slate-100 bg-white hover:border-brand-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-3 rounded-xl ${cat.color} text-white mb-3`}>
                <cat.icon size={22} />
              </div>
              <span className="text-sm font-bold text-slate-800 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* AI Idea Panel */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              key={selectedCategory + aiIdeaId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl p-8 md:p-12 mb-14"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-brand-600 font-bold">
                  <Sparkles size={20} />
                  <span>AI Idea: {selectedCategory}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!loading && aiIdea && (
                    <>
                      <button
                        onClick={() => toggleFavorite({ id: aiIdeaId, type: 'tip', text: aiIdea, category: selectedCategory })}
                        title={isFavorited(aiIdeaId) ? 'Remove from saved' : 'Save idea'}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <Heart size={20} className={isFavorited(aiIdeaId) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                      </button>
                      <button
                        onClick={refreshIdea}
                        title="Get another idea"
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <RotateCcw size={18} className="text-slate-400" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="animate-spin text-brand-500 mb-4" size={40} />
                  <p className="text-slate-500 font-medium italic">Cooking up a great idea for you and the kids...</p>
                </div>
              ) : (
                <div className="markdown-body">
                  <Markdown>{aiIdea}</Markdown>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Ideas Grid */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display text-slate-900 mb-8">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_IDEAS.map((idea) => {
              const favorited = isFavorited(idea.id);
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{idea.category}</span>
                    <button
                      onClick={() => toggleFavorite({ id: idea.id, type: 'idea', text: idea.description, title: idea.title, category: idea.category })}
                      title={favorited ? 'Remove from saved' : 'Save project'}
                      className="p-1.5 hover:bg-slate-50 rounded-full transition-colors"
                    >
                      <Heart size={17} className={favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-slate-400'} />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{idea.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 flex-1">{idea.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {idea.materials.map((m, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{m}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className={`px-2 py-1 rounded-full ${difficultyColor[idea.difficulty]}`}>{idea.difficulty}</span>
                    <span className="text-slate-400">· Ages {idea.age}</span>
                    <span className="text-slate-400">· {idea.time}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
