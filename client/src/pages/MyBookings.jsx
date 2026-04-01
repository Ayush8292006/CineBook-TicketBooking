import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useLocation } from 'react-router-dom'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormate'
import { CalendarIcon, ClockIcon, TicketIcon, MapPinIcon, CreditCardIcon, ChevronRightIcon, StarIcon, X, Printer, Film, User } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const MyBookings = () => {

    const { axios, getToken, user, backendUrl, image_base_url } = useAppContext()
    const currency = import.meta.env.VITE_CURRENCY || '₹'
    const [searchParams] = useSearchParams()
    const location = useLocation()

    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState(null)

    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        
        if (success === 'true') {
            toast.success("Payment successful! Your tickets are booked.");
            window.history.replaceState({}, '', '/my-bookings');
            setTimeout(() => getMyBookings(), 500);
        } else if (canceled === 'true') {
            toast.error("Payment was cancelled. Please try again.");
            window.history.replaceState({}, '', '/my-bookings');
        }
    }, [searchParams, location]);

    const getMyBookings = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get(`${backendUrl}/api/user/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setBookings(data.bookings || [])
            }
        } catch (error) {
            console.error("Error fetching bookings:", error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (user) {
            getMyBookings()
        }
    }, [user])

    const formatTime12hr = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const formatDateLong = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }

    const handlePrint = () => {
        const printContent = document.getElementById('ticket-print-content')
        const originalContent = document.body.innerHTML
        document.body.innerHTML = printContent.innerHTML
        window.print()
        document.body.innerHTML = originalContent
        window.location.reload()
    }

    if (isLoading) {
        return <Loading />
    }

    return (
        <>
            {/* Ticket Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setSelectedTicket(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="relative max-w-md w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-10"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            
                            <div id="ticket-print-content">
                                {/* Ticket Header */}
                                <div className="bg-gradient-to-r from-primary to-primary-dull p-5 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Film className="w-8 h-8 text-white" />
                                        <h2 className="text-2xl font-bold text-white">CineBook</h2>
                                    </div>
                                    <p className="text-white/80 text-xs">E-Ticket • Valid with ID proof</p>
                                </div>
                                
                                {/* Ticket Content */}
                                <div className="p-5 space-y-4">
                                    <div className="text-center border-b border-white/10 pb-3">
                                        <h3 className="text-xl font-bold text-white">{selectedTicket.show?.movie?.title}</h3>
                                        <div className="flex items-center justify-center gap-2 mt-1">
                                            <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs text-gray-400">{selectedTicket.show?.movie?.vote_average?.toFixed(1)}/10</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-400">{timeFormat(selectedTicket.show?.movie?.runtime)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <CalendarIcon className="w-4 h-4 text-primary mb-1" />
                                            <p className="text-[10px] text-gray-500">DATE</p>
                                            <p className="text-sm font-semibold text-white">{formatDateLong(selectedTicket.show?.showDateTime)}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <ClockIcon className="w-4 h-4 text-primary mb-1" />
                                            <p className="text-[10px] text-gray-500">TIME</p>
                                            <p className="text-sm font-semibold text-white">{formatTime12hr(selectedTicket.show?.showDateTime)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-primary/10 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-400">Seats</span>
                                            <span className="text-base font-bold text-primary">{selectedTicket.bookedSeats?.join(", ")}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-400">Amount</span>
                                            <span className="text-xl font-bold text-white">{currency}{selectedTicket.amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Booking ID</span>
                                            <span className="text-xs font-mono text-gray-300">{selectedTicket._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <MapPinIcon className="w-4 h-4 text-primary mx-auto mb-1" />
                                        <p className="text-xs text-gray-400">PVR Cinemas • Screen 4</p>
                                        <p className="text-[10px] text-gray-500 mt-1">Please arrive 15 minutes before showtime</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Ticket Footer */}
                            <div className="bg-white/5 p-4 text-center border-t border-white/10">
                                <button
                                    onClick={handlePrint}
                                    className="w-full py-2.5 bg-primary rounded-lg text-black font-medium text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print / Download Ticket
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className='relative min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pt-28 pb-20 px-4 md:px-8 lg:px-32'>
                
                {/* Background Elements */}
                <BlurCircle top='50px' left='10%' size='300px' opacity='0.2' />
                <BlurCircle bottom='0px' right='5%' size='400px' opacity='0.15' />
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-12'
                >
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                        <div>
                            <div className='flex items-center gap-2 mb-2'>
                                <TicketIcon className='w-6 h-6 text-primary' />
                                <h1 className='text-3xl md:text-4xl font-bold text-white'>
                                    My <span className='text-primary'>Bookings</span>
                                </h1>
                            </div>
                            <p className='text-gray-500 text-sm'>
                                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
                            </p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className='flex gap-3'>
                            <div className='bg-white/5 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10'>
                                <p className='text-xs text-gray-500'>Total Spent</p>
                                <p className='text-xl font-bold text-primary'>
                                    {currency}{bookings.reduce((sum, item) => sum + (item.amount || 0), 0)}
                                </p>
                            </div>
                            <div className='bg-white/5 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10'>
                                <p className='text-xs text-gray-500'>Total Tickets</p>
                                <p className='text-xl font-bold text-white'>
                                    {bookings.reduce((sum, item) => sum + (item.bookedSeats?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bookings Grid */}
                {bookings.length > 0 ? (
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                        {bookings.map((item, index) => (
                            <motion.div 
                                key={item._id || index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className='group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300'
                            >
                                {/* Status Badge */}
                                <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b border-white/10 ${
                                    item.isPaid 
                                        ? 'bg-emerald-500/10 text-emerald-400' 
                                        : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                    <span className='flex items-center gap-2'>
                                        {item.isPaid ? '✓ Confirmed' : '⏳ Pending Payment'}
                                    </span>
                                    {!item.isPaid && item.paymentLink && (
                                        <a 
                                            href={item.paymentLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className='px-3 py-1 bg-primary rounded-lg text-black text-xs font-medium hover:bg-primary/80 transition'
                                        >
                                            Pay Now
                                        </a>
                                    )}
                                </div>
                                
                                <div className='p-5'>
                                    <div className='flex gap-4'>
                                        {/* Poster */}
                                        <div className='relative flex-shrink-0'>
                                            <img 
                                                src={image_base_url + item.show?.movie?.poster_path} 
                                                alt={item.show?.movie?.title} 
                                                className='w-24 h-32 object-cover rounded-xl shadow-lg'
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Details */}
                                        <div className='flex-1'>
                                            <h3 className='text-lg font-bold text-white mb-1 group-hover:text-primary transition line-clamp-1'>
                                                {item.show?.movie?.title}
                                            </h3>
                                            
                                            <div className='flex flex-wrap gap-3 text-xs text-gray-400 mb-3'>
                                                <div className='flex items-center gap-1'>
                                                    <CalendarIcon className='w-3 h-3' />
                                                    <span>{dateFormat(item.show?.showDateTime)}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <ClockIcon className='w-3 h-3' />
                                                    <span>{formatTime12hr(item.show?.showDateTime)}</span>
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <MapPinIcon className='w-3 h-3' />
                                                    <span>Screen 4</span>
                                                </div>
                                            </div>
                                            
                                            <div className='flex items-center gap-4 mb-3'>
                                                <div>
                                                    <p className='text-[10px] text-gray-500'>Seats</p>
                                                    <p className='text-sm font-semibold text-primary'>{item.bookedSeats?.join(", ") || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className='text-[10px] text-gray-500'>Tickets</p>
                                                    <p className='text-sm font-semibold text-white'>{item.bookedSeats?.length || 0}</p>
                                                </div>
                                                <div>
                                                    <p className='text-[10px] text-gray-500'>Amount</p>
                                                    <p className='text-base font-bold text-primary'>{currency}{item.amount}</p>
                                                </div>
                                            </div>
                                            
                                            {item.isPaid && (
                                                <button
                                                    onClick={() => setSelectedTicket(item)}
                                                    className='mt-2 w-full py-2 bg-white/10 hover:bg-primary/20 rounded-lg text-white text-sm font-medium transition flex items-center justify-center gap-2'
                                                >
                                                    <TicketIcon className='w-4 h-4' />
                                                    View Ticket
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='flex flex-col items-center justify-center py-20'
                    >
                        <div className='w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-5 border border-white/10'>
                            <TicketIcon className='w-12 h-12 text-gray-500' />
                        </div>
                        <h3 className='text-2xl font-bold text-white mb-2'>No Bookings Yet</h3>
                        <p className='text-gray-500 text-center max-w-md'>
                            You haven't made any bookings yet. Start exploring movies!
                        </p>
                        <Link to='/movies'>
                            <button className='mt-8 px-8 py-3 bg-primary rounded-full font-medium text-black transition hover:scale-105 hover:shadow-lg hover:shadow-primary/50'>
                                Browse Movies
                            </button>
                        </Link>
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default MyBookings