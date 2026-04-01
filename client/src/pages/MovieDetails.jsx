import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Heart, 
  PlayCircleIcon, 
  StarIcon, 
  X, 
  Maximize2, 
  Minimize2, 
  Calendar, 
  Clock, 
  Share2, 
  Users, 
  ChevronDown, 
  ChevronUp,
  Ticket
} from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [showDates, setShowDates] = useState({})
  const [liked, setLiked] = useState(false)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 1.05])

  const { shows, axios, getToken, user, fetchFavoriteMovies, backendUrl, favoriteMovies, image_base_url } = useAppContext()

  const getMovieDetails = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/show/${id}`)
      if (data.success) {
        setMovie(data.movie)
        setShowDates(data.shows)
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
      toast.error("Failed to load movie details")
    }
  }

  const fetchTrailer = async () => {
    try {
      toast.loading("Loading trailer...", { id: "trailer" })
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
        params: {
          api_key: 'd53d1e92c0efa6e894d94ed3a54a6590',
          language: 'en-US'
        }
      })
      const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube')
      toast.dismiss("trailer")
      if (trailer) {
        setTrailerKey(trailer.key)
        setTrailerOpen(true)
      } else {
        toast.error("Trailer not available")
      }
    } catch (error) {
      toast.dismiss("trailer")
      toast.error("Failed to load trailer")
    }
  }

  const handleFavorite = async () => {
    try {
      if (!user) {
        toast.error("Please login to add favorites")
        navigate('/sign-in')
        return
      }
      
      const token = await getToken()
      const { data } = await axios.post(`${backendUrl}/api/user/update-favorite`, {
        movieId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.success) {
        await fetchFavoriteMovies()
        toast.success(data.message || "Favorites updated")
        setLiked(!liked)
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast.error(error.response?.data?.message || "Failed to update favorites")
    }
  }

  const shareMovie = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const toggleFullscreen = () => {
    const trailerContainer = document.getElementById('trailer-container')
    if (!trailerContainer) return
    
    if (!isFullscreen) {
      if (trailerContainer.requestFullscreen) {
        trailerContainer.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (id) {
      getMovieDetails()
    }
  }, [id])

  useEffect(() => {
    if (favoriteMovies && id) {
      const isFav = favoriteMovies.some(m => m._id === id)
      setLiked(isFav)
    }
  }, [favoriteMovies, id])

  if (!movie) {
    return <Loading />
  }

  return (
    <>
      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerOpen && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setTrailerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              id="trailer-container"
            >
              <button
                onClick={() => setTrailerOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-primary transition z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="absolute -top-12 right-12 text-white hover:text-primary transition z-10"
              >
                {isFullscreen ? <Minimize2 className="w-7 h-7" /> : <Maximize2 className="w-7 h-7" />}
              </button>
              <div className="relative pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  id="trailer-iframe"
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&showinfo=0&enablejsapi=1`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Full Background Coverage */}
      <div ref={heroRef} className="relative min-h-[75vh] sm:min-h-[85vh] overflow-hidden">
        <motion.div 
          style={{ scale, opacity }}
          className="absolute inset-0"
        >
          <img
            src={image_base_url + movie.backdrop_path}
            alt=""
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1920x1080?text=Movie+Backdrop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-40 min-h-[75vh] sm:min-h-[85vh] flex items-center">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start w-full">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group w-full lg:w-auto flex justify-center"
            >
              <div className="relative inline-block">
                <img
                  src={image_base_url + movie.poster_path}
                  alt={movie.title}
                  className="w-40 sm:w-48 md:w-56 lg:w-64 rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 mx-auto lg:mx-0"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'
                  }}
                />
                {/* Rating Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 border border-yellow-500/30">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold text-xs">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 text-center lg:text-left"
            >
              {/* Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 mb-3">
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/20 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-semibold text-primary border border-primary/30">
                  NOW SHOWING
                </span>
                {movie.genres?.slice(0, 2).map((genre, idx) => (
                  <span key={idx} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] sm:text-xs text-gray-300 border border-white/10">
                    {genre.name}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 sm:mb-3">
                {movie.title}
              </h1>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm">{timeFormat(movie.runtime)}</span>
                </div>
                <div className="w-px h-3 bg-gray-700 hidden sm:block" />
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm">{new Date(movie.release_date).getFullYear()}</span>
                </div>
                <div className="w-px h-3 bg-gray-700 hidden sm:block" />
                <div className="flex items-center gap-1 text-gray-300">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm">2D • 4K</span>
                </div>
              </div>

              {/* Description */}
              <div className="max-w-2xl mx-auto lg:mx-0 mb-4">
                <p className={`text-gray-300 leading-relaxed text-xs sm:text-sm ${!isDescriptionExpanded && 'line-clamp-3'}`}>
                  {movie.overview}
                </p>
                {movie.overview.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-primary text-xs font-medium mt-2 hover:underline flex items-center gap-1 mx-auto lg:mx-0"
                  >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                    {isDescriptionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#dateSelect"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-dull rounded-full font-semibold text-black text-xs sm:text-sm shadow-xl hover:shadow-primary/50 transition-all duration-300 flex items-center gap-1"
                >
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Book Tickets</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchTrailer}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-xs sm:text-sm hover:bg-white/20 hover:border-primary/50 transition-all duration-300 flex items-center gap-1"
                >
                  <PlayCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Trailer</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFavorite}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border transition-all duration-300 ${
                    liked 
                      ? 'bg-red-500/20 border-red-500 text-red-500' 
                      : 'bg-white/10 border-white/20 text-gray-300 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${liked ? 'fill-red-500' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={shareMovie}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-gray-300 hover:bg-white/20 hover:border-primary/50 transition-all duration-300"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10 max-w-xs mx-auto lg:mx-0">
                <div>
                  <p className="text-[10px] text-gray-500">IMDb Rating</p>
                  <p className="text-sm font-bold text-white">{movie.vote_average?.toFixed(1)}/10</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Box Office</p>
                  <p className="text-sm font-bold text-white">$1.9B</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Awards</p>
                  <p className="text-sm font-bold text-white">+150</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-black to-gray-950">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Cast Section */}
          {movie.casts && movie.casts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10 sm:mb-16"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-primary rounded-full" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Cast & Crew</h2>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{movie.casts.length} members</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {movie.casts.slice(0, 12).map((cast, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    key={index}
                    className="group cursor-pointer text-center"
                  >
                    <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-1 sm:mb-2">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-dull opacity-0 group-hover:opacity-100 transition duration-300 blur-sm" />
                      <img
                        src={cast.profile_path ? image_base_url + cast.profile_path : `https://ui-avatars.com/api/?name=${cast.name}&background=8b5cf6&color=fff&size=64`}
                        className="relative w-full h-full rounded-full object-cover border border-gray-700 group-hover:border-primary transition-all duration-300"
                        alt={cast.name}
                      />
                    </div>
                    <p className="text-[10px] sm:text-xs text-white font-medium group-hover:text-primary transition line-clamp-1">
                      {cast.name}
                    </p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 line-clamp-1">{cast.character || "Character"}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Date Select Section */}
          {Object.keys(showDates).length > 0 && (
            <motion.div 
              id="dateSelect" 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10 sm:mb-16"
            >
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-1 h-5 sm:h-6 bg-primary rounded-full" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Select Show Date</h2>
              </div>
              <DateSelect dateTime={showDates} id={id} />
            </motion.div>
          )}

          {/* You May Also Like */}
          {shows && shows.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-primary rounded-full" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">You May Also Like</h2>
                </div>
                <button
                  onClick={() => navigate('/movies')}
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 transition"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {shows.filter(s => s._id !== id).slice(0, 4).map((movieItem, index) => (
                  <motion.div
                    key={movieItem._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MovieCard movie={movieItem} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default MovieDetails