import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, Plus, X, ArrowLeft, Send, Users, Clock } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Newborn & Baby', 'Toddlers', 'Teens', 'Single Dads', 'Co-Parenting', 'Step-Dads', 'Dad Hacks'];

type Post = {
  id: number;
  author: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comment_count: number;
  created_at: string;
};

type Comment = {
  id: number;
  author: string;
  content: string;
  created_at: string;
};

type PostDetail = Post & { comments: Comment[] };

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr + 'Z').getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function avatarColor(name: string) {
  const colors = ['bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-indigo-500'];
  return colors[name.charCodeAt(0) % colors.length];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div className={`${s} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── New Post Modal ───────────────────────────────────────────────────────────

function NewPostModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (post: Post) => void }) {
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('General');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !title.trim() || !content.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, category, title, content }),
      });
      if (!res.ok) throw new Error();
      const post = await res.json();
      onSubmit(post);
    } catch {
      setError('Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-slate-900">Start a Discussion</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Your Name</label>
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. DadOfTwo_Mike"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's on your mind?"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Your Post</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
              placeholder="Share your experience, question, or tip..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
          </div>
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-60">
            {loading ? 'Posting...' : 'Post to Fatherhood'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Post Detail View ─────────────────────────────────────────────────────────

function PostView({ postId, onBack }: { postId: number; onBack: () => void }) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then(r => r.json())
      .then(data => { setPost(data); setLoading(false); });
  }, [postId]);

  const handleLike = async () => {
    if (liked || !post) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
    const data = await res.json();
    setPost(p => p ? { ...p, likes: data.likes } : p);
    setLiked(true);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim() || !post) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: commentAuthor, content: commentContent }),
    });
    const comment = await res.json();
    setPost(p => p ? { ...p, comments: [...p.comments, comment] } : p);
    setCommentContent('');
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!post) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 text-sm font-semibold">
        <ArrowLeft size={16} /> Back to Fatherhood
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar name={post.author} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">{post.author}</span>
              <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-semibold">{post.category}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Clock size={11} />{timeAgo(post.created_at)}
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl text-slate-900 mb-4">{post.title}</h1>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
          <button onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? 'text-brand-600' : 'text-slate-500 hover:text-brand-600'}`}>
            <ThumbsUp size={16} className={liked ? 'fill-brand-600' : ''} />
            {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MessageSquare size={16} />
            {post.comments.length} {post.comments.length === 1 ? 'Reply' : 'Replies'}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4 mb-6">
        {post.comments.map(comment => (
          <motion.div key={comment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={comment.author} size="sm" />
              <span className="font-bold text-slate-900 text-sm">{comment.author}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} />{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed pl-10">{comment.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Comment form */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6">
        <h3 className="font-display text-xl text-slate-900 mb-4">Join the conversation</h3>
        <form onSubmit={handleComment} className="space-y-3">
          <input value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          <div className="flex gap-3">
            <textarea value={commentContent} onChange={e => setCommentContent(e.target.value)}
              placeholder="Share your thoughts, advice, or support..." rows={3}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
            <button type="submit" disabled={submitting || !commentAuthor.trim() || !commentContent.trim()}
              className="px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 self-end">
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const fetchPosts = async (category: string) => {
    setLoading(true);
    const url = category === 'All' ? '/api/posts' : `/api/posts?category=${encodeURIComponent(category)}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(selectedCategory); }, [selectedCategory]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedPostId(null);
  };

  const handleNewPost = (post: Post) => {
    setPosts(prev => [{ ...post, comment_count: 0 }, ...prev]);
    setShowNewPost(false);
    setSelectedPostId(post.id);
  };

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {!selectedPostId && (
          <div className="mb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-5">
              <Users size={14} className="text-brand-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Dad Community</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="text-5xl md:text-7xl font-display text-slate-900 mb-3">Fatherhood</motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-slate-600 text-lg max-w-xl">
              A space for dads at every stage — share your wins, ask questions, offer support. No judgement, just dads helping dads.
            </motion.p>
          </div>
        )}

        {/* Post detail */}
        <AnimatePresence mode="wait">
          {selectedPostId ? (
            <PostView key={selectedPostId} postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Controls */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowNewPost(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors flex-shrink-0">
                  <Plus size={16} /> New Post
                </button>
              </div>

              {/* Post list */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <MessageSquare size={40} strokeWidth={1.5} className="mx-auto mb-3" />
                  <p>No posts yet in this category. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <motion.button key={post.id} onClick={() => setSelectedPostId(post.id)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="w-full text-left bg-white rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <Avatar name={post.author} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{post.author}</span>
                            <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-semibold">{post.category}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto"><Clock size={11} />{timeAgo(post.created_at)}</span>
                          </div>
                          <h3 className="font-display text-xl text-slate-900 mb-1">{post.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                              <ThumbsUp size={13} />{post.likes}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                              <MessageSquare size={13} />{post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New post modal */}
      <AnimatePresence>
        {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />}
      </AnimatePresence>
    </div>
  );
}
