import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime = {}, id }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const onBookHandler = () => {
    if (!selected) return toast('Please select a date')
    navigate(`/movies/${id}/${selected}`)
    scrollTo(0, 0)
  }

  return (
    <div id='dateSelect' className='pt-24 px-4'>

      <div className='relative max-w-5xl mx-auto p-6 md:p-8 
      rounded-2xl border border-white/10 
      bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]'>

        <BlurCircle top='-80px' left='-80px' />
        <BlurCircle top='80px' right='-40px' />

        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <h2 className='text-xl md:text-2xl font-semibold text-white'>
            Select Date
          </h2>

          <button
            onClick={onBookHandler}
            className='hidden md:block px-6 py-2.5 bg-primary rounded-full 
            text-sm font-medium hover:bg-primary-dull 
            transition-all duration-300 hover:scale-105'
          >
            Continue →
          </button>
        </div>

        {/* Date Selector */}
        <div className='flex items-center gap-4'>

          {/* Left Arrow */}
          <button className='p-2 rounded-full bg-white/10 hover:bg-white/20 transition'>
            <ChevronLeftIcon className='w-5 h-5 text-white' />
          </button>

          {/* Dates */}
          <div className='flex-1 overflow-x-auto no-scrollbar'>
            <div className='flex gap-4 w-max'>

              {Object.keys(dateTime).length > 0 ? (
                Object.keys(dateTime).map((date) => {
                  const d = new Date(date)

                  return (
                    <button
                      key={date}
                      onClick={() => setSelected(date)}
                      className={`group flex flex-col items-center justify-center 
                      min-w-[70px] h-20 rounded-xl transition-all duration-300 
                      ${
                        selected === date
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className='text-lg font-semibold'>
                        {d.getDate()}
                      </span>
                      <span className='text-xs uppercase'>
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </button>
                  )
                })
              ) : (
                <span className='text-gray-400 text-sm'>
                  No show dates available
                </span>
              )}

            </div>
          </div>

          {/* Right Arrow */}
          <button className='p-2 rounded-full bg-white/10 hover:bg-white/20 transition'>
            <ChevronRightIcon className='w-5 h-5 text-white' />
          </button>

        </div>

        {/* Mobile Button */}
        <button
          onClick={onBookHandler}
          className='mt-8 w-full md:hidden px-6 py-3 bg-primary rounded-xl 
          text-sm font-medium hover:bg-primary-dull 
          transition-all duration-300 active:scale-95'
        >
          Continue Booking
        </button>

      </div>
    </div>
  )
}

export default DateSelect