import React from 'react';
import { assets } from '../assets/assets';
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full flex items-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat scale-[1.13] md:scale-[1.07]
                   brightness-122 contrast-118 saturate-115 -z-10
                   animate-slowZoom"
        style={{
          backgroundImage: "url('/backgroundImage.jpg')",
          backgroundPosition: "center 20%",
        }}
      />

      {/* Dark Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/75 to-black/90 -z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent -z-10" />

      {/* Animated Glow Blob */}
      <div className="absolute -top-48 -left-48 w-[520px] h-[520px] 
                    bg-gradient-to-br from-cyan-400/30 via-teal-500/25 to-transparent 
                    blur-[170px] rounded-full animate-glowBlob -z-10" />

      {/* Main Content - Left aligned on all screens */}
      <div className="relative z-10 w-full px-5 sm:px-10 md:px-16 lg:px-24">
        
        {/* Marvel Logo - Left aligned */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <img
            src={assets.marvelLogo}
            alt="Marvel Studios"
            className="h-7 sm:h-9 md:h-11 lg:h-12 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Title - Left aligned */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
                       leading-[1.2] font-black uppercase tracking-[-1px] text-white">
            <span className="block">SPIDER-MAN:</span>
            <span 
              className="relative block mt-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
                         whitespace-nowrap font-black"
              style={{ color: '#00D1C1' }}
            >
              NO WAY HOME
            </span>
          </h1>
        </div>

        {/* Info Badges - Left aligned */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-7">
          <span className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white/10 backdrop-blur-xl border border-white/20 
                         rounded-full text-[10px] sm:text-xs font-semibold tracking-wider text-white">
            ACTION • ADVENTURE • SCI-FI
          </span>

          <span className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-white/10 border border-white/20 
                         rounded-full text-xs sm:text-sm text-gray-200">
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /> 2021
          </span>

          <span className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-white/10 border border-white/20 
                         rounded-full text-xs sm:text-sm text-gray-200">
            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /> 2h 28m
          </span>
        </div>

        {/* Description - Left aligned */}
        <p className="mt-5 sm:mt-8 text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-lg">
          Peter Parker's secret identity is revealed to the world. Desperate for a fresh start, 
          he turns to Doctor Strange for help — but when the spell goes wrong, the multiverse 
          tears open, unleashing deadly villains from other realities.
        </p>

        {/* Button - Left aligned */}
        <div className="mt-6 sm:mt-10">
          <button
            onClick={() => navigate('/movies')}
            className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-primary hover:bg-white 
                     text-black font-bold text-xs sm:text-sm uppercase tracking-[1px] rounded-full 
                     transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
          >
            Explore Now
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Bottom Tag - Left aligned */}
      <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-6 md:left-20 text-white/60 sm:text-white/70 text-[8px] sm:text-xs tracking-[2px] font-medium">
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

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .animate-slowZoom {
            animation: slowZoom 25s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;