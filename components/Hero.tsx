'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_POSTS = [
  {
    id: 1,
    tag: "Live Event",
    title: "Monday Night RAW: The Road to SummerSlam",
    description: "Witness the fallout from last night's main event. Roman Reigns returns to face his biggest challenge yet.",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 2,
    tag: "Exclusive",
    title: "The Rise of Cody Rhodes: A Hero's Journey",
    description: "Go behind the scenes with the American Nightmare as he prepares for his title defense.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 3,
    tag: "Upcoming",
    title: "NXT Heatwave: Full Match Card Revealed",
    description: "The next generation of superstars prepare for the ultimate showdown in Orlando.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 4,
    tag: "Spotlight",
    title: "SmackDown's New Era: The Bloodline Evolves",
    description: "Solo Sikoa takes control of the Bloodline. See what's next for the blue brand's most dominant faction.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 5,
    tag: "Documentary",
    title: "Legends of the Ring: The Undertaker's Legacy",
    description: "A deep dive into three decades of darkness. Exclusive interviews and never-before-seen footage.",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1920&auto=format&fit=crop",
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_POSTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % HERO_POSTS.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + HERO_POSTS.length) % HERO_POSTS.length);

  return (
    <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden bg-brand-black">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] scale-105"
            style={{ backgroundImage: `url(${HERO_POSTS[current].image})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 max-w-5xl">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold leading-tight text-white tracking-tight drop-shadow-2xl">
                  {HERO_POSTS[current].title}
                </h1>
                <p className="text-gray-100 text-sm sm:text-base md:text-2xl font-medium max-w-3xl leading-relaxed drop-shadow-lg opacity-90">
                  {HERO_POSTS[current].description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <button className="flex-1 sm:flex-none bg-brand-red hover:bg-red-700 text-white px-4 sm:px-12 py-3 sm:py-5 rounded-xl font-bold uppercase text-[10px] sm:text-sm tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl">
                  <Play size={16} className="sm:w-[20px] sm:h-[20px]" fill="currentColor" /> 
                  <span className="whitespace-nowrap">Watch Now</span>
                </button>
                <button className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 sm:px-12 py-3 sm:py-5 rounded-xl font-bold uppercase text-[10px] sm:text-sm tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg">
                  <Calendar size={16} className="sm:w-[20px] sm:h-[20px]" /> 
                  <span className="whitespace-nowrap">Schedule</span>
                </button>
              </div>


            </motion.div>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-6 md:right-12 flex items-center gap-4 z-20">
        <div className="flex gap-2 mr-4">
          {HERO_POSTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-500 rounded-full ${current === i ? 'w-8 bg-brand-red' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prevSlide} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-sm">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}


