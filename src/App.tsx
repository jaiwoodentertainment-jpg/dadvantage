import React from 'react';
import Hero from './components/Hero';
import DailyMotivation from './components/DailyMotivation';
import ParentingIdeas from './components/ParentingIdeas';
import { Heart, Github, Twitter, Mail } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-xl">D</div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">DadVantage</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-brand-600 transition-colors">Motivation</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Ideas</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Community</a>
            <button className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
              Join Free
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Hero />
        <DailyMotivation />
        <ParentingIdeas />
        
        {/* Call to Action Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
              <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to lead your family?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of fathers receiving weekly wisdom and practical parenting hacks directly to their inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[300px]"
              />
              <button className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all">
                Subscribe Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-xl">D</div>
                <span className="font-display font-bold text-xl tracking-tight text-slate-900">DadVantage</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed">
                Empowering fathers to lead with love, patience, and purpose. Because being a dad is the most important job you'll ever have.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Resources</h4>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li><a href="#" className="hover:text-brand-600 transition-colors">Daily Motivation</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Parenting Playbook</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Dad Hacks</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Mental Health</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all">
                  <Github size={20} />
                </a>
                <a href="#" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2024 DadVantage. All rights reserved.</p>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> for dads everywhere
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
