import React from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { Mail, Phone, ChevronUp, Ticket, Star, Film, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle link click with scroll to top
  const handleLinkClick = (e, to) => {
    if (location.pathname === to) {
      e.preventDefault();
      scrollToTop();
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#030303] to-[#000000] pt-24 pb-12 px-6 md:px-16 lg:px-40 overflow-hidden">
      
      {/* ✨ Cinematic Top Border with Animation */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
      
      {/* Background Cinematic Lights */}
      <div className="absolute top-40 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      
      {/* Film Strip Pattern - Subtle */}
      <div className="absolute inset-x-0 bottom-0 h-32 opacity-5" 
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, 
            transparent, 
            transparent 20px, 
            rgba(255,255,255,0.3) 20px, 
            rgba(255,255,255,0.3) 22px)`,
          backgroundSize: '30px 100%'
        }} 
      />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-16 pb-16 border-b border-white/10">
        
        {/* 🎬 Brand Section - Enhanced */}
        <div className="flex-1 space-y-8">
          <Link 
            to="/" 
            onClick={(e) => handleLinkClick(e, '/')}
            className="inline-block group"
          >
            <div className="relative">
              <img 
                alt="CineBook" 
                className="h-16 md:h-20 w-auto brightness-110 group-hover:scale-105 transition-all duration-500 ease-out filter drop-shadow-lg" 
                src={assets.logo} 
              />
              <div className="absolute -bottom-2 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500" />
            </div>
          </Link>
          
          <p className="max-w-sm text-base md:text-lg text-gray-400 leading-relaxed font-light italic border-l-2 border-primary/50 pl-4">
            "Your ticket to the greatest stories ever told. Experience cinema like never before."
          </p>

          {/* Social/Stats Badge */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
              <Film className="w-3 h-3 text-primary" />
              <span>4K Streaming</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
              <Heart className="w-3 h-3 text-primary" />
              <span>100K+ Users</span>
            </div>
          </div>
        </div>

        {/* 🔗 Links & Contact Grid - Modern Layout */}
        <div className="flex-[1.5] grid grid-cols-2 md:grid-cols-3 gap-12">
          
          {/* Experience Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              Experience
            </h3>
            <ul className="space-y-4">
              {['/', '/movies', '/my-bookings'].map((path, idx) => {
                const labels = ['Home', 'Now Showing', 'My Tickets'];
                return (
                  <li key={idx}>
                    <Link 
                      to={path} 
                      onClick={(e) => handleLinkClick(e, path)}
                      className="text-sm md:text-base text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all duration-300"></span>
                      {labels[idx]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Studio Section - Updated */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              Studio
            </h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/about" 
                  onClick={(e) => handleLinkClick(e, '/about')}
                  className="text-sm md:text-base text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal#privacy" 
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm md:text-base text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal#terms" 
                  onClick={() => window.scrollTo(0, 0)}
                  className="text-sm md:text-base text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-[2px] bg-primary transition-all duration-300"></span>
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section - Enhanced with Gradient */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-4 h-[2px] bg-primary"></span>
              Support
            </h3>
            <ul className="space-y-5">
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 hover:text-white transition-all duration-300 cursor-pointer group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-white/5 to-white/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">contact@cinebook.com</span>
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-400 hover:text-white transition-all duration-300 cursor-pointer group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-white/5 to-white/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">+1-234-567-890</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Apps & Copyright - Enhanced */}
      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <img 
            src={assets.googlePlay} 
            alt="Play Store" 
            className="h-10 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105 cursor-pointer filter drop-shadow-lg" 
          />
          <img 
            src={assets.appStore} 
            alt="App Store" 
            className="h-10 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105 cursor-pointer filter drop-shadow-lg" 
          />
        </div>

        <div className="text-center md:text-right space-y-2">
          <p className="text-xs font-medium text-gray-500 tracking-wide">
            {currentYear} © CineBook • Crafted with 
            <span className="text-primary inline-block animate-pulse mx-1">♥</span> 
            by <span className="text-white hover:text-primary transition-colors cursor-pointer font-semibold">Ayush</span>
          </p>
          <p className="text-[10px] text-gray-700 font-mono tracking-wider">
            Version 2.0.7 • All Rights Reserved
          </p>
        </div>
      </div>

      {/* 🔼 Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 group"
        aria-label="Scroll to top"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-br from-primary to-primary/80 p-3 rounded-full shadow-2xl group-hover:scale-110 transition-all duration-300 cursor-pointer border border-white/20">
            <ChevronUp className="w-5 h-5 text-white" />
          </div>
        </div>
      </button>

      {/* Animated Gradient Overlay on Hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
    </footer>
  )
}

export default Footer