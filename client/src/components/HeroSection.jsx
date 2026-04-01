import React from 'react';
import { assets } from '../assets/assets';
import { ArrowRight, CalendarIcon, ClockIcon, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full flex items-center overflow-hidden">

      {/* Background Image - Bright & Cinematic */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat scale-[1.13] md:scale-[1.07]
                   brightness-122 contrast-118 saturate-115 -z-10
                   animate-slowZoom"
        style={{
          backgroundImage: "url('/backgroundImage.jpg')",
          backgroundPosition: "center 20%",
        }}
      />

      {/* Premium Dark Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/75 to-black/90 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent -z-10" />

      {/* Animated Glow Blob */}
      <div className="absolute -top-48 -left-48 w-[520px] h-[520px] 
                    bg-gradient-to-br from-cyan-400/30 via-teal-500/25 to-transparent 
                    blur-[170px] rounded-full animate-glowBlob -z-10" />

      {/* Main Content - Left Aligned */}
      <div className="relative z-10 max-w-3xl px-6 sm:px-10 md:px-16 lg:px-24 w-full text-left">

        {/* Marvel Logo */}
        <img
          src={assets.marvelLogo}
          alt="Marvel Studios"
          className="h-9 sm:h-11 md:h-12 mb-8 drop-shadow-2xl"
        />

        {/* Title - "NO WAY HOME" in Single Line for Big Screens */}
        <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] 2xl:text-[5.5rem] 
                     leading-[1.1] font-black uppercase tracking-[-2px] text-white">
          <span className="block">SPIDER-MAN:</span>
          <span 
            className="relative  block mt-1 whitespace-nowrap text-[70px] "
            style={{ color: '#00D1C1' }}
          >
            NO WAY HOME
          </span>
        </h1>

        {/* Info Badges */}
        <div className="flex flex-wrap gap-3 mt-7">
          <span className="px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/20 
                         rounded-full text-xs font-semibold tracking-widest text-white">
            ACTION • ADVENTURE • SCI-FI
          </span>

          <span className="flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 
                         rounded-full text-sm text-gray-200">
            <CalendarIcon className="w-4 h-4 text-primary" /> 2021
          </span>

          <span className="flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 
                         rounded-full text-sm text-gray-200">
            <ClockIcon className="w-4 h-4 text-primary" /> 2h 28m
          </span>
        </div>

        {/* Description */}
        <p className="mt-8 text-base sm:text-lg text-gray-200 leading-relaxed max-w-lg">
          Peter Parker's secret identity is revealed to the world. Desperate for a fresh start, 
          he turns to Doctor Strange for help — but when the spell goes wrong, the multiverse 
          tears open, unleashing deadly villains from other realities.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={() => navigate('/movies')}
            className="group flex items-center gap-3 px-10 py-4 bg-primary hover:bg-white 
                     text-black font-bold text-sm uppercase tracking-[1.5px] rounded-full 
                     transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
          >
            Explore Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Bottom Tag */}
      <div className="absolute bottom-8 left-6 md:left-20 text-white/70 text-xs tracking-[3px] font-medium">
        NOW STREAMING
      </div>

      {/* Production Animations */}
      <style jsx>{`
        @keyframes slowZoom {
          0%   { transform: scale(1.13); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1.13); }
        }

        .animate-slowZoom {
          animation: slowZoom 35s ease-in-out infinite;
        }

        @keyframes glowBlob {
          0%, 100% { opacity: 0.45; transform: scale(0.95); }
          50% { opacity: 0.70; transform: scale(1.06); }
        }

        .animate-glowBlob {
          animation: glowBlob 13s ease-in-out infinite;
        }

        /* Beautiful Cyan Glow for "NO WAY HOME" */
        .custom-cyan-glow {
          text-shadow: 
            0 0 25px #00D1C1,
            0 0 45px #00D1C1,
            0 0 70px rgba(0, 209, 193, 0.75),
            0 0 100px rgba(0, 209, 193, 0.5);
          animation: cyanGlow 4.2s ease-in-out infinite alternate;
        }

        @keyframes cyanGlow {
          from {
            text-shadow: 
              0 0 20px #00D1C1,
              0 0 40px rgba(0, 209, 193, 0.85);
          }
          to {
            text-shadow: 
              0 0 32px #00D1C1,
              0 0 60px #00D1C1,
              0 0 90px rgba(0, 209, 193, 0.8);
          }
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 768px) {
          .custom-cyan-glow {
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;