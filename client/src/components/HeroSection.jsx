import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <div className='relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-40 h-screen overflow-hidden'>
      
      {/* 🎬 Background with Dual Gradient Overlay */}
      <div 
        className='absolute inset-0 bg-[url("/backgroundImage.jpg")] bg-cover bg-center -z-10 scale-105 group-hover:scale-100 transition-transform duration-1000'
        style={{ backgroundImage: "url('/backgroundImage.jpg')" }}
      />
      <div className='absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent -z-10' />
      <div className='absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent -z-10' />

      {/* Marvel Logo with Subtle Glow */}
      <img 
        src={assets.marvelLogo} 
        alt='Marvel' 
        className='max-h-10 lg:h-10 opacity-90 drop-shadow-[0_0_15px_rgba(237,29,36,0.5)]'
      />

      {/* Main Title - Bold & Impactful */}
      <div className='space-y-2'>
        <h1 className='text-5xl md:text-[85px] leading-[0.9] font-black uppercase italic tracking-tighter text-white drop-shadow-2xl'>
          Spider‑Man: <br/> 
          <span className='text-primary shadow-primary/20'>No Way Home</span>
        </h1>
      </div>

      {/* Meta Info Tabs (Glassmorphic style) */}
      <div className='flex flex-wrap items-center gap-3'>
        <span className='px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-black uppercase tracking-widest'>
          Action | Adventure | Sci-Fi
        </span>
        <div className='flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-md text-[10px] font-bold text-gray-300'>
            <CalendarIcon className='w-3.5 h-3.5 text-primary' /> 2021
        </div>
        <div className='flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/5 rounded-md text-[10px] font-bold text-gray-300'>
            <ClockIcon className='w-3.5 h-3.5 text-primary' /> 2h 28m
        </div>
      </div>

      {/* Description - Tightened line height */}
      <p className='max-w-xl text-sm md:text-base text-gray-400 leading-relaxed font-medium mb-4'>
        With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.
      </p>

      {/* Action Buttons */}
      <div className='flex flex-wrap items-center gap-4'>
        <button 
          onClick={()=> navigate('/movies')} 
          className='group flex items-center gap-3 px-8 py-4 bg-primary text-black rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer'
        >
          Explore Movies
          <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform'/>
        </button>

        <button className='flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition rounded-full font-black text-xs uppercase tracking-[0.2em] text-white cursor-pointer'>
          <Play className='w-4 h-4 fill-white' /> Watch Trailer
        </button>
      </div>

      {/* Bottom Decorative Element */}
      <div className='absolute bottom-10 left-6 md:left-16 lg:left-40 flex flex-col gap-1'>
          <div className='w-12 h-[2px] bg-primary' />
          <p className='text-[10px] font-black uppercase tracking-[0.5em] text-white/40'>Now Streaming</p>
      </div>
    </div>
  )
}

export default HeroSection 