import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { image_base_url } = useAppContext();

  return (
    <div className="group relative w-full h-[520px] rounded-2xl overflow-hidden cursor-pointer bg-black">

      {/* Image */}
      <img
        src={image_base_url+movie.backdrop_path}
        alt=""
        loading="lazy"
        onClick={() => {
          navigate(`/movies/${movie._id}`)
          scrollTo(0, 0)
        }}
        className="absolute inset-0 w-full h-full object-cover object-center 
        transition-transform duration-700 ease-out 
        group-hover:scale-110"
      />

      {/* High Quality Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"></div>

      {/* Top Blur Layer (Glass Effect) */}
      <div className="absolute inset-0 backdrop-blur-[1px] opacity-30 group-hover:opacity-50 transition"></div>

      {/* Rating */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/80 px-3 py-1 rounded-full text-xs backdrop-blur-md shadow-lg">
        <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-white font-medium">
          {movie.vote_average.toFixed(1)}
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 w-full p-5 
        translate-y-12 opacity-0 
        group-hover:translate-y-0 group-hover:opacity-100 
        transition-all duration-500 ease-out">

        <p className="text-white font-semibold text-xl truncate">
          {movie.title}
        </p>

        <p className="text-sm text-gray-300 mt-1">
          {new Date(movie.release_date).getFullYear()} •{" "}
          {movie.genres.slice(0, 2).map(g => g.name).join(" | ")} •{" "}
          {timeFormat(movie.runtime)}
        </p>

        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`)
            scrollTo(0, 0)
          }}
          className="mt-4 w-full py-2.5 text-sm bg-primary rounded-lg font-medium 
          hover:bg-primary-dull transition-all duration-300 
          hover:scale-[1.03] active:scale-95 shadow-md"
        >
          Buy Tickets
        </button>
      </div>

    </div>
  )
}

export default MovieCard