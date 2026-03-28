import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] pt-24 pb-12 px-6 md:px-16 lg:px-40 overflow-hidden">
      
      {/* 🔝 Cinematic Top Border Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-16 pb-16 border-b border-white/5">
        
        {/* 🍿 Brand Section */}
        <div className="flex-1 space-y-8">
          <Link to="/" className="inline-block group">
            <img 
              alt="CineBook" 
              className="h-16 md:h-20 w-auto brightness-110 group-hover:scale-105 transition-transform duration-500 ease-out" 
              src={assets.logo} 
            />
          </Link>
          
          <p className="max-w-sm text-base md:text-lg text-gray-400 leading-relaxed font-medium italic">
            "Your ticket to the greatest stories ever told. Experience cinema like never before."
          </p>

         
        </div>

        {/* 🔗 Links & Contact Grid */}
        <div className="flex-[1.5] grid grid-cols-2 md:grid-cols-3 gap-12">
          
          {/* Platform */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Experience</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/movies" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Now Showing</Link></li>
              <li><Link to="/top-rated" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Top Rated</Link></li>
              <li><Link to="/my-bookings" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">My Tickets</Link></li>
            </ul>
          </div>

          {/* Company - Legal Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">The Studio</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/legal#privacy" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal#terms" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-6 col-span-2 md:col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Support</h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                contact@cinebook.com
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer group">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +1-234-567-890
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Apps & Copyright */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <img src={assets.googlePlay} alt="Play Store" className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" />
          <img src={assets.appStore} alt="App Store" className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" />
        </div>

        <div className="text-center md:text-right">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            {currentYear} © CineBook • Crafted with <span className="text-primary">♥</span> by <span className="text-white hover:text-primary cursor-pointer transition-colors">Ayush</span>
          </p>
          <p className="text-[9px] text-gray-800 font-medium mt-1">Version 2.0.7 • All Rights Reserved</p>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </footer>
  )
}

export default Footer