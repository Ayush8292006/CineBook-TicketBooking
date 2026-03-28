import { ArrowRightIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import { dummyShowsData } from '../assets/assets'
import MovieCard from './MovieCard'

const FeatureSection = () => {
  const navigate = useNavigate()

  return (
    <div className='px-6 md:px-12 lg:px-20 xl:px-32 overflow-hidden'>

      {/* Header */}
      <div className='relative flex items-center justify-between pt-16 pb-6'>
        <BlurCircle top='0' right='-80px' />

        <h2 className='text-white text-2xl md:text-3xl font-semibold tracking-wide'>
          Now Showing
        </h2>

        <button
          onClick={() => navigate('/movies')}
          className='group flex items-center gap-2 text-sm text-gray-300 hover:text-white transition'
        >
          View All
          <ArrowRightIcon className='group-hover:translate-x-1 transition duration-300 w-4 h-4' />
        </button>
      </div>

      {/* Movies Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6'>
        {dummyShowsData.slice(0, 4).map((show) => (
          <MovieCard key={show._id} movie={show} />
        ))}
      </div>

      {/* Show More Button */}
      <div className='flex justify-center mt-16'>
        <button
          onClick={() => {
            navigate('/movies')
            scrollTo(0, 0)
          }}
          className='px-10 py-3 text-sm bg-primary rounded-full font-medium mb-10
          hover:bg-primary-dull transition-all duration-300 
          hover:scale-105 active:scale-95 shadow-lg'
        >
          Show More
        </button>
      </div>

    </div>
  )
}

export default FeatureSection