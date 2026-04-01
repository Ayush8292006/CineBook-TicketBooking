import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon, TicketIcon, CreditCardIcon, FilmIcon, ChevronRightIcon, CalendarIcon, UsersIcon, StarIcon, SparklesIcon, ShieldCheckIcon, ArmchairIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {
  // Define seat layout groups
  const seatGroups = [
    { rows: ["A"], position: "center", width: "full" },
    { rows: ["B"], position: "center", width: "full" },
    { rows: ["C", "D"], position: "split", width: "half" },
    { rows: ["E", "F"], position: "split", width: "half" },
    { rows: ["G", "H"], position: "split", width: "half" },
    { rows: ["I"], position: "center", width: "full" },
    { rows: ["J"], position: "center", width: "full" }
  ]

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [showTimes, setShowTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [activeTab, setActiveTab] = useState('seats')

  const navigate = useNavigate()
  const { axios, getToken, user, backendUrl } = useAppContext()

  const getShowDetails = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        toast.error("Please login to book tickets")
        setLoading(false)
        return
      }
      
      const { data } = await axios.get(`${backendUrl}/api/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.success) {
        setShow(data.movie)
        setShowTimes(data.shows)
      } else {
        toast.error(data.message || "Failed to load show details")
      }
    } catch (error) {
      console.error("Error fetching show details:", error)
      toast.error(error.response?.data?.message || "Failed to load show details")
    } finally {
      setLoading(false)
    }
  }

  const getOccupiedSeats = async () => {
    if (!selectedTime?.showId) return
    
    try {
      const token = await getToken()
      const { data } = await axios.get(`${backendUrl}/api/booking/seats/${selectedTime.showId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || [])
      } else {
        setOccupiedSeats([])
      }
    } catch (error) {
      console.error("Error fetching occupied seats:", error)
      setOccupiedSeats([])
    }
  }

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) {
      toast.error("This seat is already booked!")
      return
    }
    
    if (!selectedTime) {
      toast.error("Please select a show time first")
      return
    }
    
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      toast.error("You can only select up to 5 seats")
      return
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const isSeatOccupied = (seatId) => occupiedSeats.includes(seatId)

  const renderSeatRow = (row, count = 8, isCenter = true) => (
    <div key={row} className={`flex items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-3 ${isCenter ? 'justify-center' : ''} flex-wrap justify-center`}>
      <span className="text-xs sm:text-sm font-mono font-bold text-primary w-5 sm:w-6">{row}</span>
      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isSelected = selectedSeats.includes(seatId)
          const isOccupied = isSeatOccupied(seatId)

          return (
            <button
              key={seatId}
              onClick={() => !isOccupied && handleSeatClick(seatId)}
              disabled={isOccupied}
              className={`
                w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center
                text-[10px] sm:text-xs font-bold transition-all duration-300
                ${isOccupied
                  ? "bg-red-500/20 border border-red-500/50 text-red-400 cursor-not-allowed"
                  : isSelected
                    ? "bg-primary text-black scale-105 shadow-lg shadow-primary/50"
                    : "bg-gray-800/80 border border-gray-700 text-gray-400 hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-lg"
                }
              `}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderSplitRows = (rows) => (
    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 mb-3">
      {rows.map((row, idx) => (
        <div key={row} className="flex items-center gap-1 sm:gap-2 md:gap-3 justify-center">
          <span className="text-xs sm:text-sm font-mono font-bold text-primary w-5 sm:w-6">{row}</span>
          <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
            {Array.from({ length: 8 }, (_, i) => {
              const seatId = `${row}${i + 1}`
              const isSelected = selectedSeats.includes(seatId)
              const isOccupied = isSeatOccupied(seatId)

              return (
                <button
                  key={seatId}
                  onClick={() => !isOccupied && handleSeatClick(seatId)}
                  disabled={isOccupied}
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center
                    text-[10px] sm:text-xs font-bold transition-all duration-300
                    ${isOccupied
                      ? "bg-red-500/20 border border-red-500/50 text-red-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-primary text-black scale-105 shadow-lg shadow-primary/50"
                        : "bg-gray-800/80 border border-gray-700 text-gray-400 hover:border-primary hover:text-primary hover:-translate-y-1 hover:shadow-lg"
                    }
                  `}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  const bookTickets = async () => {
    if (!user) {
      toast.error("Please login to book tickets")
      return
    }

    if (!selectedTime) {
      toast.error("Please select a show time")
      return
    }

    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat")
      return
    }

    setBookingInProgress(true)
    
    try {
      const token = await getToken()
      
      if (!token) {
        toast.error("Please login again")
        setBookingInProgress(false)
        return
      }
      
      const bookingData = {
        showId: selectedTime.showId,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * (selectedTime.price || 200)
      }
      
      const { data } = await axios.post(`${backendUrl}/api/booking/create`, bookingData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Booking failed")
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login again")
      } else if (error.response?.status === 409) {
        toast.error("Some seats were already booked! Please select different seats.")
        await getOccupiedSeats()
        setSelectedSeats([])
      } else {
        toast.error(error.response?.data?.message || "Booking failed. Please try again.")
      }
    } finally {
      setBookingInProgress(false)
    }
  }

  useEffect(() => {
    if (id && date) {
      getShowDetails()
    }
  }, [id, date])

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats()
      setSelectedSeats([])
    }
  }, [selectedTime])

  const totalPrice = selectedSeats.length * (selectedTime?.price || 200)

  if (loading) {
    return <Loading />
  }

  if (!show) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center px-4'>
        <div className="text-center">
          <FilmIcon className="w-16 sm:w-24 h-16 sm:h-24 text-gray-700 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">The movie you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/movies')}
            className="px-5 sm:px-6 py-2 sm:py-3 bg-primary text-black rounded-lg font-semibold hover:scale-105 transition text-sm sm:text-base"
          >
            Back to Movies
          </button>
        </div>
      </div>
    )
  }

  const availableTimes = showTimes[date] || []

  return (
    <div className='min-h-screen bg-black text-white pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-32 px-3 sm:px-4 md:px-8 relative overflow-hidden'>
      
      {/* Background Effects */}
      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle bottom='0px' right='0px' />

      {/* Decorative Ribbon - Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-teal-500 to-primary animate-gradient-x" />
      
      {/* Decorative Ribbon - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-teal-500 to-primary animate-gradient-x" />

      <div className='max-w-[1400px] mx-auto relative z-10'>
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full mb-4 sm:mb-6">
            <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs text-gray-300">Now Showing</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-primary to-teal-400 bg-clip-text text-transparent px-2">
            {show.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-1 sm:gap-2">
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span>{date}</span>
            </div>
            <div className="w-1 h-1 bg-primary rounded-full hidden sm:block" />
            <div className="flex items-center gap-1 sm:gap-2">
              <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span>{occupiedSeats.length} Seats Booked</span>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('seats')}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                activeTab === 'seats'
                  ? 'bg-gradient-to-r from-primary to-teal-600 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Select Seats
            </button>
            <button
              onClick={() => setActiveTab('times')}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm ${
                activeTab === 'times'
                  ? 'bg-gradient-to-r from-primary to-teal-600 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Show Times
            </button>
          </div>
        </div>

        {/* Content - Mobile: Column layout */}
        {activeTab === 'times' ? (
          // Show Times Grid - Mobile: 1 column
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {availableTimes.length > 0 ? (
              availableTimes.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTime(item)
                    setActiveTab('seats')
                  }}
                  className={`relative overflow-hidden cursor-pointer bg-white/5 backdrop-blur border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:scale-105 ${
                    selectedTime?.time === item.time
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-white/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    {selectedTime?.time === item.time && (
                      <span className="text-[10px] sm:text-xs text-primary font-semibold bg-primary/20 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{isoTimeFormat(item.time)}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Duration: 2h 30m</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500">Price per seat</p>
                      <p className="text-lg sm:text-xl font-bold text-primary">₹{item.price}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 sm:py-16">
                <TicketIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm sm:text-base">No shows available for this date</p>
              </div>
            )}
          </div>
        ) : (
          // Seat Selection - Mobile: Column layout (seat map then booking summary)
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left - Seat Map (full width on mobile) */}
            <div className="lg:col-span-2 order-1">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 relative overflow-hidden">
                {/* Decorative Ribbon inside card */}
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 sm:w-24 h-5 sm:h-6 bg-gradient-to-l from-primary to-teal-500 transform rotate-45 translate-x-5 sm:translate-x-6 -translate-y-2 sm:-translate-y-3 shadow-lg" />
                </div>
                
                {/* Legend - Mobile optimized */}
                <div className="flex justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] sm:text-xs text-gray-500">1</div>
                    <span className="text-[10px] sm:text-xs">Available</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary flex items-center justify-center text-[10px] sm:text-xs text-black">1</div>
                    <span className="text-[10px] sm:text-xs">Selected</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-[10px] sm:text-xs text-red-400">1</div>
                    <span className="text-[10px] sm:text-xs">Booked</span>
                  </div>
                </div>

                {/* Screen */}
                <div className="text-center mb-6 sm:mb-10 relative">
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  <img src={assets.screenImage} alt="screen" className="w-full max-w-xl mx-auto opacity-80 px-2" />
                  <div className="h-0.5 w-32 sm:w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mt-1 sm:mt-2" />
                  <p className="text-gray-500 text-[8px] sm:text-xs mt-1 sm:mt-2 tracking-widest">⟵ S C R E E N ⟶</p>
                </div>

                {/* Seats - Custom Layout with responsive sizing */}
                <div className="flex flex-col items-center justify-center overflow-x-auto pb-2">
                  {/* Row A - Center */}
                  <div className="w-full flex justify-center mb-1 sm:mb-2">
                    {renderSeatRow("A", 8, true)}
                  </div>
                  
                  {/* Row B - Center */}
                  <div className="w-full flex justify-center mb-1 sm:mb-2">
                    {renderSeatRow("B", 8, true)}
                  </div>
                  
                  {/* Rows C & D - Split Left and Right */}
                  <div className="w-full mb-1 sm:mb-2">
                    {renderSplitRows(["C", "D"])}
                  </div>
                  
                  {/* Rows E & F - Split Left and Right */}
                  <div className="w-full mb-1 sm:mb-2">
                    {renderSplitRows(["E", "F"])}
                  </div>
                  
                  {/* Rows G & H - Split Left and Right */}
                  <div className="w-full mb-1 sm:mb-2">
                    {renderSplitRows(["G", "H"])}
                  </div>
                  
                  {/* Row I - Center */}
                  <div className="w-full flex justify-center mb-1 sm:mb-2">
                    {renderSeatRow("I", 8, true)}
                  </div>
                  
                  {/* Row J - Center */}
                  <div className="w-full flex justify-center mb-1 sm:mb-2">
                    {renderSeatRow("J", 8, true)}
                  </div>
                </div>

                {/* Stats with Ribbon */}
                {selectedTime && (
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 relative">
                    <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-gray-400 text-[10px] sm:text-xs">Occupied:</span>
                        <span className="font-bold text-primary text-xs sm:text-sm">{occupiedSeats.length}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-400 text-[10px] sm:text-xs">Available:</span>
                        <span className="font-bold text-green-500 text-xs sm:text-sm">{80 - occupiedSeats.length}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <ArmchairIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="text-gray-400 text-[10px] sm:text-xs">Total:</span>
                        <span className="font-bold text-xs sm:text-sm">80</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Booking Summary (full width on mobile, sticky on desktop) */}
            <div className="lg:col-span-1 order-2">
              <div className="sticky top-24 space-y-4 sm:space-y-6">
                
                {/* Selected Show */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-teal-500" />
                  <h3 className="font-bold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    Selected Show
                  </h3>
                  {selectedTime ? (
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <span className="text-[10px] sm:text-xs">Show Time</span>
                        <span className="font-bold text-primary text-[10px] sm:text-xs">{isoTimeFormat(selectedTime.time)}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-[10px] sm:text-xs">Price per Seat</span>
                        <span className="font-bold text-sm sm:text-base">₹{selectedTime.price}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 sm:py-4">
                      <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-[10px] sm:text-xs text-gray-400">No show time selected</p>
                      <button
                        onClick={() => setActiveTab('times')}
                        className="mt-2 text-primary text-[10px] sm:text-xs hover:underline"
                      >
                        Select a time →
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected Seats */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-teal-500" />
                  <h3 className="font-bold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                    <TicketIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    Selected Seats
                  </h3>
                  {selectedSeats.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {selectedSeats.map(seat => (
                          <span key={seat} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary/20 rounded-lg text-[10px] sm:text-xs font-semibold text-primary border border-primary/30">
                            {seat}
                          </span>
                        ))}
                      </div>
                      <div className="border-t border-white/10 pt-2 sm:pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-gray-400">Total Amount</span>
                          <div className="text-right">
                            <span className="text-lg sm:text-xl font-bold text-primary">₹{totalPrice}</span>
                            <p className="text-[8px] sm:text-[10px] text-gray-500">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 sm:py-4">
                      <TicketIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-[10px] sm:text-xs text-gray-400">No seats selected</p>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                {selectedSeats.length > 0 && selectedTime && (
                  <button
                    onClick={bookTickets}
                    disabled={bookingInProgress}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-teal-600 text-black rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <div className="relative z-10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <CreditCardIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Pay Now</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base sm:text-lg font-black">₹{totalPrice}</span>
                        <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-1 text-[8px] sm:text-[10px] text-gray-500">
                  <ShieldCheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>Secure Checkout • 100% Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}

export default SeatLayout