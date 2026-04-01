import { StarIcon, Heart, Clock, Calendar, Ticket, Eye, TrendingUp, Sparkles, Play, Info } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { image_base_url, favoriteMovies, fetchFavoriteMovies, axios, getToken, backendUrl, user } = useAppContext()
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(favoriteMovies?.some(m => m._id === movie._id) || false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleFavorite = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast.error("Please login to add favorites")
      navigate('/sign-in')
      return
    }
    
    try {
      const token = await getToken()
      const { data } = await axios.post(`${backendUrl}/api/user/update-favorite`, {
        movieId: movie._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.success) {
        setIsFavorite(!isFavorite)
        if (fetchFavoriteMovies) {
          await fetchFavoriteMovies()
        }
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites")
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
    }
  }

  const handleCardClick = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  const hdImageUrl = image_base_url + movie.backdrop_path

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={!isMobile ? { y: -6 } : {}}
      className="relative group"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Subtle Glow Effect */}
      <motion.div 
        className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-md"
        animate={{ 
          scale: isHovered && !isMobile ? 1.01 : 1,
        }}
      />
      
      {/* Main Card */}
      <div className="relative w-full h-[460px] rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br from-gray-900 to-black shadow-xl border border-white/5 group-hover:border-primary/20 transition-all duration-400">
        
        {/* Image Container */}
        <div className="absolute inset-0 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
          )}
          
          <motion.img
            src={hdImageUrl}
            alt={movie.title}
            loading="lazy"
            onClick={handleCardClick}
            className="w-full h-full object-cover object-center transition-all duration-700"
            onLoad={() => setImageLoaded(true)}
            animate={{ 
              scale: isHovered && !isMobile ? 1.05 : 1,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ filter: isHovered && !isMobile ? 'brightness(1.03)' : 'brightness(0.98)' }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 via-60% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
        
        {/* Top Gradient Edge */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
        
        {/* Rating Badge */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10 z-10"
        >
          <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold text-xs">
            {movie.vote_average?.toFixed(1)}
          </span>
          <span className="text-gray-400 text-[9px]">/10</span>
        </motion.div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFavorite}
          className="absolute top-3 left-3 p-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/10 hover:border-red-500/50 transition-all duration-300 z-10 group/btn"
        >
          <Heart 
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-white/70 group-hover/btn:text-red-500'
            }`} 
          />
        </motion.button>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          {/* Title */}
          <motion.h3 
            className="text-white font-bold text-lg truncate mb-1.5"
            animate={{ 
              y: isHovered && !isMobile ? -2 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {movie.title}
          </motion.h3>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary/70" />
              <span className="text-gray-300 text-xs">{new Date(movie.release_date).getFullYear()}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary/70" />
              <span className="text-gray-300 text-xs">{timeFormat(movie.runtime)}</span>
            </div>
          </div>

          {/* Genres - Always visible on mobile, on hover on desktop */}
          <div className={`flex flex-wrap gap-1 mb-2 ${!isMobile ? 'hidden' : ''}`}>
            {movie.genres?.slice(0, 2).map((genre, idx) => (
              <span 
                key={idx} 
                className="text-[9px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300 border border-white/5"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Action Buttons - Always visible on mobile, on hover on desktop */}
          <div className={`flex gap-2 pt-1 ${!isMobile ? 'hidden group-hover:flex' : 'flex'}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCardClick}
              className="flex-1 py-2 bg-gradient-to-r from-primary to-primary-dull rounded-lg font-semibold text-black text-[11px] flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:shadow-primary/30"
            >
              <Ticket className="w-3 h-3" />
              <span>Book Now</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/movies/${movie._id}`)}
              className="px-3 py-2 bg-white/10 rounded-lg text-white text-[11px] flex items-center gap-1 hover:bg-white/20 transition-all duration-300 border border-white/10"
            >
              <Info className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Static Stats - Only show on desktop when not hovered */}
          {!isMobile && !isHovered && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-1"
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary/60" />
                <span className="text-[9px] text-gray-400">{movie.vote_count?.toLocaleString()} votes</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-primary/60" />
                <span className="text-[9px] text-gray-400">Trending</span>
              </div>
            </motion.div>
          )}

          {/* Mobile Stats */}
          {isMobile && (
            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-primary/60" />
                <span className="text-[8px] text-gray-400">{movie.vote_count?.toLocaleString()} votes</span>
              </div>
              <div className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
              <div className="flex items-center gap-1">
                <Eye className="w-2.5 h-2.5 text-primary/60" />
                <span className="text-[8px] text-gray-400">Trending</span>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Shine Effect - Only on desktop */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)'
            }}
          />
        )}
        
        {/* Corner Accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition duration-300">
          <div className="absolute top-0 right-0 w-20 h-5 bg-gradient-to-l from-primary/20 to-transparent transform rotate-45 translate-x-5 -translate-y-2" />
        </div>
      </div>
    </motion.div>
  )
}

export default MovieCard