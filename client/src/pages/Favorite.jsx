import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { Heart, Film, Sparkles, ArrowRight, Trash2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'

const Favorite = () => {
  const navigate = useNavigate()
  const { favoriteMovies, fetchFavoriteMovies, user, axios, getToken, backendUrl } = useAppContext()

  useEffect(() => {
    if (user && fetchFavoriteMovies) {
      fetchFavoriteMovies()
    }
  }, [user])

  const removeFromFavorites = async (movieId) => {
    try {
      const token = await getToken()
      const { data } = await axios.post(`${backendUrl}/api/user/update-favorite`, {
        movieId: movieId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.success) {
        await fetchFavoriteMovies()
      }
    } catch (error) {
      console.error("Error removing from favorites:", error)
    }
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center'>
        <div className='text-center px-6'>
          <div className='w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center animate-pulse'>
            <Heart className='w-12 h-12 text-primary' />
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>Login Required</h1>
          <p className='text-gray-400 text-lg mb-8'>Please login to view your favorite movies</p>
          <button
            onClick={() => navigate('/')}
            className='px-8 py-3 bg-gradient-to-r from-primary to-primary-dull rounded-full font-semibold text-black hover:shadow-lg hover:shadow-primary/50 transition-all duration-300'
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return favoriteMovies.length > 0 ? (
    <div className='relative pt-32 pb-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-screen bg-gradient-to-b from-black via-gray-950 to-black'>
      
      {/* Background Elements */}
      <BlurCircle top='-100px' left='-100px' size='500px' opacity='0.3' />
      <BlurCircle bottom='-50px' right='-50px' size='400px' opacity='0.2' />
      <BlurCircle top='50%' left='50%' size='300px' opacity='0.1' />
      
      {/* Animated Background Particles */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className='absolute w-1 h-1 bg-primary/20 rounded-full animate-float'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='relative mb-16 text-center'
      >
        {/* Badge */}
        <div className='inline-flex items-center gap-2 px-5 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/30 mb-6'>
          <Heart className='w-4 h-4 text-primary fill-primary' />
          <span className='text-xs font-bold text-primary uppercase tracking-wider'>My Collection</span>
        </div>
        
        {/* Title */}
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-4'>
          My <span className='bg-gradient-to-r from-primary to-primary-dull bg-clip-text text-transparent'>Favorites</span>
        </h1>
        
        {/* Subtitle */}
        <p className='text-gray-400 text-base md:text-lg max-w-2xl mx-auto'>
          Movies you've loved and saved for later
        </p>

        {/* Stats */}
        <div className='mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm'>
          <Film className='w-4 h-4 text-primary' />
          <span className='text-sm text-gray-300'>{favoriteMovies.length} {favoriteMovies.length === 1 ? 'Movie' : 'Movies'} in your collection</span>
        </div>
      </motion.div>

      {/* Movie Grid Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-white/10'
      >
        <div>
          <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
            <Heart className='w-5 h-5 text-primary fill-primary' />
            Your Saved Movies
          </h2>
          <p className='text-sm text-gray-500 mt-1'>Click on any movie to book tickets</p>
        </div>
        
        <button
          onClick={() => navigate('/movies')}
          className='mt-4 md:mt-0 flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition group'
        >
          <span>Discover More Movies</span>
          <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition' />
        </button>
      </motion.div>

      {/* Movie Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'
      >
        <AnimatePresence>
          {favoriteMovies.map((movie, index) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className='group relative'
            >
              <div className='absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur' />
              <div className='relative'>
                <MovieCard movie={movie} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromFavorites(movie._id)
                  }}
                  className='absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/80 z-10'
                >
                  <Trash2 className='w-4 h-4 text-white hover:text-white' />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
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
        
        .blur {
          filter: blur(8px);
        }
      `}</style>
    </div>
  ) : (
    <div className='min-h-screen bg-gradient-to-b from-black to-gray-950 flex items-center justify-center'>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='text-center px-6'
      >
        <div className='relative'>
          <div className='absolute inset-0 bg-primary/20 rounded-full blur-3xl' />
          <div className='relative w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary-dull/20 rounded-full flex items-center justify-center'>
            <Heart className='w-14 h-14 text-primary' />
          </div>
        </div>
        <h1 className='text-3xl md:text-4xl font-bold text-white mb-4'>No Favorites Yet</h1>
        <p className='text-gray-400 text-lg max-w-md mx-auto mb-8'>
          Start adding movies to your favorites collection by clicking the heart icon on any movie.
        </p>
        <button
          onClick={() => navigate('/movies')}
          className='group px-8 py-3 bg-gradient-to-r from-primary to-primary-dull rounded-full font-semibold text-black hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 flex items-center gap-2 mx-auto'
        >
          <span>Browse Movies</span>
          <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition' />
        </button>
      </motion.div>
    </div>
  )
}

export default Favorite