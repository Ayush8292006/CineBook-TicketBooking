import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormate'
import { CalendarIcon, ClockIcon, TicketIcon, MapPinIcon, CreditCardIcon, ChevronRightIcon, StarIcon } from 'lucide-react'

const MyBookings = () => {

    const currency = import.meta.env.VITE_CURRENCY || '₹'

    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [hoveredCard, setHoveredCard] = useState(null)

    const getMyBookings = async() => {
        setBookings(dummyBookingData)
        setIsLoading(false)
    }

    useEffect(() => {
        getMyBookings()
    }, [])

    const getStatusColor = (isPaid) => {
        return isPaid 
            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }

    const getStatusText = (isPaid) => {
        return isPaid ? 'Confirmed ✓' : 'Pending ⏳'
    }

    return !isLoading ? (
        <div className='relative min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-16 lg:px-40'>
            
            {/* Background Blur Circles */}
            <BlurCircle top='100px' left='100px' />
            <BlurCircle bottom='0px' left='600px' />
            <BlurCircle top='200px' right='100px' />
            
            {/* Header */}
            <div className='relative mb-10'>
                <div className='flex items-center justify-between flex-wrap gap-4'>
                    <div>
                        <h1 className='text-3xl md:text-4xl font-bold'>
                            My <span className='text-primary'>Bookings</span>
                        </h1>
                        <p className='text-gray-500 text-sm mt-1'>
                            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
                        </p>
                    </div>
                    
                    {/* Stats */}
                    <div className='flex gap-3'>
                        <div className='bg-gray-900 rounded-xl px-4 py-2 border border-gray-800'>
                            <p className='text-xs text-gray-500'>Total Spent</p>
                            <p className='text-xl font-bold text-primary'>
                                {currency}{bookings.reduce((sum, item) => sum + item.amount, 0)}
                            </p>
                        </div>
                        <div className='bg-gray-900 rounded-xl px-4 py-2 border border-gray-800'>
                            <p className='text-xs text-gray-500'>Total Tickets</p>
                            <p className='text-xl font-bold text-white'>
                                {bookings.reduce((sum, item) => sum + item.bookedSeats.length, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {bookings.length > 0 ? (
                <div className='space-y-4'>
                    {bookings.map((item, index) => (
                        <div 
                            key={index} 
                            className='bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10'
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className='flex flex-col md:flex-row gap-4 p-4'>
                                
                                {/* Poster */}
                                <div className='flex gap-4 flex-1'>
                                    <img 
                                        src={item.show.movie.poster_path} 
                                        alt={item.show.movie.title} 
                                        className='w-24 h-32 object-cover rounded-lg'
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'
                                        }}
                                    />
                                    
                                    {/* Movie Details */}
                                    <div className='flex flex-col justify-between py-1'>
                                        <div>
                                            <h3 className='text-lg font-bold text-white mb-2'>
                                                {item.show.movie.title}
                                            </h3>
                                            
                                            <div className='flex flex-wrap gap-3 text-xs text-gray-400'>
                                                <div className='flex items-center gap-1'>
                                                    <ClockIcon className='w-3 h-3' />
                                                    <span>{timeFormat(item.show.movie.runtime)}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <CalendarIcon className='w-3 h-3' />
                                                    <span>{dateFormat(item.show.showDateTime)}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <StarIcon className='w-3 h-3 text-primary' />
                                                    <span>{item.show.movie.vote_average?.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Venue */}
                                        <div className='flex items-center gap-1 text-xs text-gray-500 mt-2'>
                                            <MapPinIcon className='w-3 h-3' />
                                            <span>PVR Cinemas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className='flex flex-col md:items-end justify-between gap-3 md:border-l border-gray-800 md:pl-6'>
                                    
                                    {/* Status */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.isPaid)} border`}>
                                        {getStatusText(item.isPaid)}
                                    </div>
                                    
                                    {/* Amount */}
                                    <div className='text-right'>
                                        <p className='text-2xl font-bold text-primary'>
                                            {currency}{item.amount}
                                        </p>
                                    </div>
                                    
                                    {/* Ticket Details */}
                                    <div className='text-right text-sm space-y-1'>
                                        <div className='flex items-center gap-2 justify-end'>
                                            <TicketIcon className='w-3 h-3 text-primary' />
                                            <p><span className='text-gray-500'>Tickets:</span> <span className='font-semibold'>{item.bookedSeats.length}</span></p>
                                        </div>
                                        <p><span className='text-gray-500'>Seats:</span> <span className='font-semibold text-primary'>{item.bookedSeats.join(", ")}</span></p>
                                    </div>
                                    
                                    {/* Button */}
                                    {!item.isPaid && (
                                        <button className='px-5 py-2 bg-primary hover:bg-primary-dull rounded-full text-black font-medium text-sm transition hover:scale-105 flex items-center gap-2'>
                                            <CreditCardIcon className='w-3 h-3' />
                                            Pay Now
                                        </button>
                                    )}
                                    
                                    {item.isPaid && (
                                        <button className='text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1'>
                                            View Details
                                            <ChevronRightIcon className='w-3 h-3' />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Empty State
                <div className='flex flex-col items-center justify-center py-20'>
                    <div className='w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4'>
                        <TicketIcon className='w-10 h-10 text-gray-600' />
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-2'>No Bookings Yet</h3>
                    <p className='text-gray-500 text-center max-w-md'>
                        You haven't made any bookings yet. Start exploring movies!
                    </p>
                    <button 
                                        onClick={() => window.location.href = '/movies'}
                        className='mt-6 px-6 py-2 bg-primary hover:bg-primary-dull rounded-full font-medium text-black transition hover:scale-105'
                    >
                        Browse Movies
                    </button>
                </div>
            )}
        </div>
    ) : <Loading />
}

export default MyBookings