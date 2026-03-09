import React from 'react';
import { Shield, Heart, Zap, BookOpen, Coffee, Camera } from 'lucide-react';

export const CATEGORIES = [
  { id: 'patience', name: 'Patience & Calm', icon: Shield, color: 'bg-blue-500' },
  { id: 'connection', name: 'Deep Connection', icon: Heart, color: 'bg-rose-500' },
  { id: 'play', name: 'Active Play', icon: Zap, color: 'bg-amber-500' },
  { id: 'learning', name: 'Teaching Moments', icon: BookOpen, color: 'bg-emerald-500' },
  { id: 'selfcare', name: 'Dad Self-Care', icon: Coffee, color: 'bg-indigo-500' },
  { id: 'memories', name: 'Making Memories', icon: Camera, color: 'bg-purple-500' },
];

export const STATIC_IDEAS = [
  {
    title: "The 10-Minute 'No-Phone' Rule",
    description: "Dedicate the first 10 minutes after you get home solely to your kids. No phones, no chores, just presence.",
    category: "Connection"
  },
  {
    title: "Weekend Workshop",
    description: "Build something simple together—a birdhouse, a cardboard fort, or even just a complex LEGO set.",
    category: "Active Play"
  },
  {
    title: "The 'Why' Game",
    description: "Instead of getting frustrated by 'Why?', try to see how many layers of explanation you can go through together.",
    category: "Teaching Moments"
  }
];
