import React from 'react'

import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { Film, Calendar, TrendingUp, Sparkles } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Favorite = () => {

  const {favoriteMovies} = useAppContext()
  return favoriteMovies.length > 0 ? (
    <div className='relative pt-32 pb-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-screen bg-gradient-to-b from-black via-gray-950 to-black'>
      
      {/* Background Elements */}
      <BlurCircle top='-100px' left='-100px' size='500px' opacity='0.3' />
      <BlurCircle bottom='-50px' right='-50px' size='400px' opacity='0.2' />
      
      {/* Animated Background Particles */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-primary/20 rounded-full animate-float'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className='relative mb-16 text-center'>
        {/* Badge */}
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/30 mb-6 animate-pulse-slow'>
          <Sparkles className='w-4 h-4 text-primary' />
          <span className='text-xs font-bold text-primary uppercase tracking-wider'>Now Playing</span>
        </div>
        
        {/* Title */}
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-4'>
          Discover <span className='bg-gradient-to-r from-primary to-primary-dull bg-clip-text text-transparent'>Movies</span>
        </h1>
        
        {/* Subtitle */}
        <p className='text-gray-400 text-base md:text-lg max-w-2xl mx-auto'>
          Experience the magic of cinema with our curated collection of blockbuster hits and critically acclaimed masterpieces
        </p>

     \
      </div>

      {/* Movie Grid Header */}
      <div className='flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-white/10'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Now Showing</h2>
          <p className='text-sm text-gray-500 mt-1'>Book your tickets now for the latest blockbusters</p>
        </div>
        
     
      </div>

      {/* Movie Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
        {favoriteMovies.map((movie, index) => (
          <div
            key={movie._id}
            className='animate-slideUp'
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards',
              opacity: 0
            }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

   
      

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease forwards;
        }
      `}</style>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-950'>
      <div className='text-center'>
        <div className='w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center animate-pulse'>
          <Film className='w-12 h-12 text-primary' />
        </div>
        <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>No Movies Available</h1>
        <p className='text-gray-400 text-lg'>Check back later for new releases!</p>
      </div>
    </div>
  )
}

export default Favorite