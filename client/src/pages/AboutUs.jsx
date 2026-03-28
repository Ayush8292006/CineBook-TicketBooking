import React from 'react';
import { Film, Ticket, ShieldCheck, LayoutDashboard } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pt-40 animate-in fade-in duration-700">
      
      {/* 🎬 Hero Section */}
      <div className="flex flex-col items-center text-center mb-20">
        <div className='inline-flex flex-col items-center mb-4 group'>
          <div className='flex items-center gap-3 text-3xl md:text-5xl font-black uppercase tracking-tighter'>
            <span className='text-gray-400'>About</span>
            <span className='text-white relative'>
              CineBook
              <span className='absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]'></span>
            </span>
          </div>
          <p className='text-[10px] text-primary font-bold uppercase tracking-[0.4em] mt-6 opacity-70'>Powered by TMDB & Clerk</p>
        </div>

        <p className="mt-8 text-gray-400 max-w-2xl leading-relaxed text-lg font-medium">
          A modern, full-stack movie ticket booking platform designed for a seamless cinematic experience. 
          From browsing latest hits to securing your favorite spot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left: Project Focus */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-primary flex items-center gap-3">
            <span className='w-8 h-[2px] bg-primary'></span>
            What we offer
          </h2>
          <p className="text-gray-300 leading-loose text-lg">
            CineBook brings the theater to your screen. We use real-time data to show you what's trending, 
            allowing you to book shows across multiple theaters with a single account.
          </p>
          <div className='space-y-4'>
            <div className='flex items-start gap-4'>
               <div className='mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,1)]'></div>
               <p className='text-gray-400 text-sm'>Dynamic seat selection with real-time availability tracking.</p>
            </div>
            <div className='flex items-start gap-4'>
               <div className='mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,1)]'></div>
               <p className='text-gray-400 text-sm'>Secure user authentication managed by Clerk.</p>
            </div>
            <div className='flex items-start gap-4'>
               <div className='mt-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(20,184,166,1)]'></div>
               <p className='text-gray-400 text-sm'>Robust Admin Panel to manage shows, movies, and bookings.</p>
            </div>
          </div>
        </div>

        {/* Right: Actual Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-500 group">
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6'>
              <Film className="text-primary w-6 h-6" />
            </div>
            <h4 className="font-bold text-white mb-2 tracking-tight">TMDB Integration</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Fetching real-time movie details, posters, and ratings.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-500 group">
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6'>
              <Ticket className="text-primary w-6 h-6" />
            </div>
            <h4 className="font-bold text-white mb-2 tracking-tight">Easy Booking</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Select seats and get instant booking confirmations.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-500 group">
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6'>
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <h4 className="font-bold text-white mb-2 tracking-tight">Clerk Auth</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Enterprise-grade security for user login and profiles.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-500 group">
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6'>
              <LayoutDashboard className="text-primary w-6 h-6" />
            </div>
            <h4 className="font-bold text-white mb-2 tracking-tight">Admin Control</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">Dedicated dashboard for inventory and booking management.</p>
          </div>
        </div>
      </div>

      {/* 📧 Contact Section */}
      <div className="mt-28 relative overflow-hidden p-12 rounded-[40px] bg-white/[0.02] border border-white/5 text-center">
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          Built for the big screen.
        </h2>
       
        
      
      </div>
    </div>
  );
};

export default AboutUs;