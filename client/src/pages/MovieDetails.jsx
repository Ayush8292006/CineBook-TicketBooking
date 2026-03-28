import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import { motion } from 'framer-motion'
import Loading from '../components/Loading'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [liked, setLiked] = useState(false)

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    if(show){
     setShow({
        movie: show,
        dateTime: dummyDateTimeData
    })
    }
  }

  useEffect(() => {
    getShow()
  }, [id])

  return show ? (
    <div className="relative px-6 md:px-16 lg:px-28 pt-48 pb-20 overflow-hidden">
        

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={show.movie.backdrop_path}
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
          src={show.movie.poster_path}
          alt=""
          className="w-72 h-[420px] object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] mx-auto"
        />
       

        {/* Details */}
        <div className="flex flex-col gap-5 relative">

          <BlurCircle top='-80px' left='-80px' />

          <p className="text-primary text-sm tracking-widest">ENGLISH</p>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl">
            {show.movie.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold">
              {show.movie.vote_average.toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm">User Rating</span>
          </div>

          {/* Info */}
          <p className="text-gray-400 text-sm">
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map(g => g.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          {/* Description */}
          <p className="text-gray-300 leading-relaxed max-w-xl">
            {show.movie.overview}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">

            <motion.a
              whileTap={{ scale: 0.95 }}
              href="#dateSelect"
              className="px-6 py-3 bg-primary rounded-full font-medium 
              hover:bg-primary-dull transition shadow-lg"
            >
              🎟 Book Tickets
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-600 
              rounded-full text-gray-300 hover:bg-white/10 transition"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className={`p-3 rounded-full border ${
                liked ? 'bg-red-500 border-red-500' : 'border-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked && 'fill-white'}`} />
            </motion.button>

          </div>
        </div>
      </motion.div>

      {/* Cast Section */}
      <div className="mt-24 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6">Top Cast</h2>

        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent z-10"></div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-6 w-max">

              {show.movie.casts.slice(0, 12).map((cast, index) => (
                <motion.div
                  whileHover={{ y: -8 }}
                  key={index}
                  className="flex flex-col items-center min-w-[100px]"
                >
                  <img
                    src={cast.profile_path}
                    className="h-24 w-24 rounded-full object-cover border-2 border-transparent hover:border-primary transition"
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

      {/* Date Select */}
      <div className="mt-20">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

   <div className="mt-24 max-w-6xl mx-auto">

  <h2 className="text-2xl font-semibold text-white mb-8">
    You May Also Like
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {dummyShowsData.slice(0, 4).map((movie, index) => (
      <MovieCard key={index} movie={movie} />
    ))}
  </div>

  {/* Show More Button */}
  <div className="flex justify-center mt-16">
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        navigate('/movies')
        scrollTo(0, 0)
      }}
      className="px-8 py-3 rounded-full bg-white/10 border border-white/20 
      text-white backdrop-blur-md hover:bg-primary transition"
    >
      Explore More Movies →
    </motion.button>
  </div>

</div>

    </div>
  ) : <Loading />
}

export default MovieDetails