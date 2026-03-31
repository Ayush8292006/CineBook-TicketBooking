import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import { motion } from 'framer-motion'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [showDates, setShowDates] = useState({})
  const [liked, setLiked] = useState(false)

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

const handleFavorite = async () => {
  try {
    if (!user) {
      toast.error("Please login to add favorites")
      navigate('/sign-in')
      return
    }
    
    const token = await getToken()
    console.log("Token:", token ? "YES" : "NO")
    
    const { data } = await axios.post(`${backendUrl}/api/user/update-favorite`, {
      movieId: id
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    console.log("API Response:", data)
    
    if (data.success) {
      // Refresh favorites after update
      await fetchFavoriteMovies()
      toast.success(data.message || "Favorites updated")
    } else {
      toast.error(data.message || "Failed to update")
    }
  } catch (error) {
    console.error("Error updating favorites:", error)
    toast.error(error.response?.data?.message || "Failed to update favorites")
  }
}

  useEffect(() => {
    if (id) {
      getMovieDetails()
    }
  }, [id])

  // Check if movie is in favorites
// Watch for favoriteMovies changes
useEffect(() => {
  if (favoriteMovies && id) {
    const isFav = favoriteMovies.some(m => m._id === id)
    console.log("4. Movie favorite status:", isFav)
    setLiked(isFav)
  }
}, [favoriteMovies, id])

  if (!movie) {
    return <Loading />
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-28 pt-48 pb-20 overflow-hidden">
        
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={image_base_url + movie.backdrop_path}
          alt=""
          className="w-full h-[550px] object-cover opacity-30 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black to-black"></div>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row gap-12 max-w-6xl mx-auto"
      >
        {/* Poster */}
        <motion.img
          whileHover={{ scale: 1.07 }}
          src={image_base_url + movie.poster_path}
          alt={movie.title}
          className="w-72 h-[420px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] mx-auto"
        />

        {/* Details */}
        <div className="flex flex-col gap-5 relative">
          <BlurCircle top='-80px' left='-80px' />

          <p className="text-primary text-sm tracking-widest">
            {movie.original_language?.toUpperCase() || "ENGLISH"}
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            {movie.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold">
              {movie.vote_average?.toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm">User Rating</span>
          </div>

          {/* Info */}
          <p className="text-gray-400 text-sm">
            {timeFormat(movie.runtime)} •{" "}
            {movie.genres?.map(g => g.name).join(", ") || "N/A"} •{" "}
            {movie.release_date?.split("-")[0] || "N/A"}
          </p>

          {/* Description */}
          <p className="text-gray-300 leading-relaxed max-w-xl">
            {movie.overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <motion.a
              whileTap={{ scale: 0.95 }}
              href="#dateSelect"
              className="px-6 py-3 bg-primary rounded-full font-medium hover:bg-primary-dull transition shadow-lg"
            >
              🎟 Book Tickets
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-600 rounded-full text-gray-300 hover:bg-white/10 transition"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className={`p-3 rounded-full border transition ${
                liked ? 'bg-red-500 border-red-500' : 'border-gray-600 hover:border-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-white text-white' : 'text-gray-400'}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Cast Section */}
      {movie.casts && movie.casts.length > 0 && (
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">Top Cast</h2>

          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent z-10"></div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-6 w-max">
                {movie.casts.slice(0, 12).map((cast, index) => (
                  <motion.div
                    whileHover={{ y: -8 }}
                    key={index}
                    className="flex flex-col items-center min-w-[100px]"
                  >
                    <img
                      src={cast.profile_path ? image_base_url + cast.profile_path : "https://via.placeholder.com/96"}
                      className="h-24 w-24 rounded-full object-cover border-2 border-transparent hover:border-primary transition"
                      alt={cast.name}
                    />
                    <p className="text-sm text-gray-300 mt-3 text-center">
                      {cast.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Select */}
      {Object.keys(showDates).length > 0 && (
        <div id="dateSelect" className="mt-20">
          <DateSelect dateTime={showDates} id={id} />
        </div>
      )}

      {/* You May Also Like */}
      {shows && shows.length > 0 && (
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-8">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {shows.slice(0, 4).map((movieItem, index) => (
              <MovieCard key={movieItem._id || index} movie={movieItem} />
            ))}
          </div>

          {/* Show More Button */}
          <div className="flex justify-center mt-16">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/movies')
                window.scrollTo(0, 0)
              }}
              className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-primary transition"
            >
              Explore More Movies →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieDetails