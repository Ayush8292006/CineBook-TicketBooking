import React, { useState, useRef } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon, Calendar, Ticket, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const DateSelect = ({ dateTime = {}, id }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const scrollContainerRef = useRef(null)

  // Get available dates
  const availableDates = Object.keys(dateTime).sort()

  // Function to format date for display
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return { label: 'Today', day: 'Today', date: date.getDate(), month: date.toLocaleDateString('en-US', { month: 'short' }) }
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return { label: 'Tomorrow', day: 'Tomorrow', date: date.getDate(), month: date.toLocaleDateString('en-US', { month: 'short' }) }
    }
    
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  // Handle date selection and proceed to seat layout
  const handleDateSelect = (date) => {
    setSelected(date)
    // Navigate directly to seat layout with selected date
    navigate(`/movies/${id}/${date}`)
    window.scrollTo(0, 0)
    toast.success(`Selected ${formatDateDisplay(date).full || formatDateDisplay(date).label}`)
  }

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' })
    }
  }

  if (availableDates.length === 0) {
    return (
      <div id='dateSelect' className='pt-24 px-4'>
        <div className='relative max-w-5xl mx-auto p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center'>
          <Calendar className='w-16 h-16 text-gray-600 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-white mb-2'>No Shows Available</h3>
          <p className='text-gray-400'>Check back later for show timings</p>
        </div>
      </div>
    )
  }

  return (
    <div id='dateSelect' className='pt-16 md:pt-20 px-4 pb-8'>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className='relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl shadow-2xl overflow-hidden'
      >
        {/* Decorative Elements */}
        <BlurCircle top='-80px' left='-80px' size='300px' opacity='0.3' />
        <BlurCircle bottom='-60px' right='-60px' size='250px' opacity='0.2' />
        
        {/* Top Gradient Line */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0' />

        <div className='p-5 md:p-8'>
          
          {/* Header Section */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-8 bg-primary rounded-full' />
              <div>
                <h2 className='text-xl md:text-2xl font-bold text-white'>
                  Select Show Date
                </h2>
                
              </div>
            </div>

            <div className='hidden md:flex items-center gap-2'>
              <Ticket className='w-4 h-4 text-primary' />
              <span className='text-xs text-gray-400'>Select a date to proceed</span>
            </div>
          </div>

          {/* Date Selector Section */}
          <div className='mb-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Calendar className='w-4 h-4 text-primary' />
              <span className='text-sm text-gray-400'>Available Dates</span>
              <span className='text-xs text-primary ml-2'>({availableDates.length} dates)</span>
            </div>
            
            <div className='flex items-center gap-2'>
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                className='flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110'
              >
                <ChevronLeftIcon className='w-5 h-5 text-white' />
              </button>

              {/* Dates Container */}
              <div
                ref={scrollContainerRef}
                className='flex-1 overflow-x-auto scrollbar-hide'
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className='flex gap-3 md:gap-4 min-w-max'>
                  {availableDates.map((date, idx) => {
                    const dateInfo = formatDateDisplay(date)
                    const isSelected = selected === date
                    
                    return (
                      <motion.button
                        key={date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleDateSelect(date)}
                        className={`relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary to-primary-dull text-black shadow-lg shadow-primary/50 scale-105'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/15 hover:border-primary/50'
                        }`}
                      >
                        {dateInfo.label === 'Today' || dateInfo.label === 'Tomorrow' ? (
                          <>
                            <span className='text-xs font-medium opacity-80'>{dateInfo.label}</span>
                            <span className='text-xl font-bold'>{dateInfo.date}</span>
                            <span className='text-[10px] uppercase opacity-70'>{dateInfo.month}</span>
                          </>
                        ) : (
                          <>
                            <span className='text-xs uppercase opacity-70'>{dateInfo.month}</span>
                            <span className='text-2xl font-bold'>{dateInfo.day}</span>
                            <span className='text-[10px] uppercase'>{dateInfo.label}</span>
                          </>
                        )}
                        
                        {isSelected && (
                          <motion.div
                            layoutId="dateGlow"
                            className='absolute -inset-0.5 bg-primary/30 rounded-xl blur-md -z-10'
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                className='flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110'
              >
                <ChevronRightIcon className='w-5 h-5 text-white' />
              </button>
            </div>
          </div>

        
        </div>
      </motion.div>

      {/* Add scrollbar hide CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default DateSelect