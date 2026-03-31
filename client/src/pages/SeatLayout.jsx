import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {

  const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [showTimes, setShowTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [bookingInProgress, setBookingInProgress] = useState(false)

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
        console.log("Show times:", data.shows)
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
        console.log("Occupied seats:", data.occupiedSeats)
      } else {
        console.error("API error:", data.message)
        setOccupiedSeats([])
      }
    } catch (error) {
      console.error("Error fetching occupied seats:", error)
      setOccupiedSeats([])
    }
  }

  const handleSeatClick = (seatId) => {
    // Check if seat is occupied
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

  const isSeatOccupied = (seatId) => {
    return occupiedSeats.includes(seatId)
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex items-center gap-4 mt-3">
      <span className="text-xs text-gray-500 w-4">{row}</span>
      <div className="flex gap-3">
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
                relative h-10 w-10 rounded-xl flex items-center justify-center
                text-[10px] font-semibold transition-all duration-300
                
                ${isOccupied
                  ? "bg-red-500/20 border border-red-500/50 text-red-400 cursor-not-allowed"
                  : isSelected
                    ? "bg-primary text-black scale-110 shadow-[0_0_20px_rgba(20,184,166,0.7)]"
                    : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 text-gray-400 hover:text-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:-translate-y-1"
                }
              `}
            >
              {seatId}
            </button>
          )
        })}
      </div>
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
        console.log("🔑 Token in SeatLayout:", token ? "YES" : "NO")
        console.log("🔑 Token length:", token?.length)
        console.log("🔑 Backend URL:", backendUrl)
        
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
        
        console.log("📦 Booking data:", bookingData)
        
        const { data } = await axios.post(`${backendUrl}/api/booking/create`, bookingData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        
        if (data.success) {
           window.location.href=data.url;
        } else {
            toast.error(data.message || "Booking failed")
        }
    } catch (error) {
        console.error("❌ Error booking tickets:", error)
        console.error("❌ Error response:", error.response?.data)
        console.error("❌ Error status:", error.response?.status)
        
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
      // Reset selected seats when time changes
      setSelectedSeats([])
    }
  }, [selectedTime])

  const seatPrice = selectedTime?.price || 200
  const totalPrice = selectedSeats.length * seatPrice

  if (loading) {
    return <Loading />
  }

  if (!show) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-400">The movie you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/movies')}
            className="mt-4 px-6 py-2 bg-primary text-black rounded-lg"
          >
            Back to Movies
          </button>
        </div>
      </div>
    )
  }

  const availableTimes = showTimes[date] || []

  return (
    <div className='min-h-screen bg-[#020202] text-white pt-40 pb-32 px-6 md:px-16 lg:px-24 relative overflow-hidden'>

      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle bottom='0px' right='0px' />

      <div className='max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-16'>

        {/* LEFT PANEL - Show Times */}
        <div className='w-72 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl py-8 h-max md:sticky md:top-32 shadow-xl'>

          <div className='px-6 mb-6 border-l-4 border-primary'>
            <h2 className='text-2xl font-black tracking-tight'>
              {show.title}
            </h2>
            <p className='text-xs text-gray-400 uppercase tracking-widest mt-1'>
              Select Show Time
            </p>
          </div>

          <div className='space-y-3 px-4'>
            {availableTimes.length > 0 ? (
              availableTimes.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTime(item)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
                    ${selectedTime?.time === item.time
                      ? "bg-primary text-black scale-[1.03]"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:scale-[1.02]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className='w-4 h-4 text-primary' />
                    <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                  </div>
                  <span className="text-xs font-bold">₹{item.price}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No shows available for this date</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Seats */}
        <div className='flex-1 flex flex-col items-center max-md:mt-16'>

          <h1 className='text-3xl font-black mb-6 tracking-tight'>
            Select Your Seat
          </h1>

          {/* Seat Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10"></div>
              <span className="text-xs text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary"></div>
              <span className="text-xs text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-500/20 border border-red-500/50"></div>
              <span className="text-xs text-gray-400">Booked</span>
            </div>
          </div>

          {/* SCREEN */}
          <div className="w-full max-w-xl text-center mb-10">
            <img src={assets.screenImage} alt="screen" className="w-full opacity-90" />
            <div className="h-2 w-full bg-primary/20 rounded-full blur-md mt-2" />
            <p className="text-gray-500 text-xs tracking-widest mt-2">
              SCREEN THIS SIDE
            </p>
          </div>

          {/* SEATS */}
          <div className='flex flex-col items-center mt-6 text-xs text-gray-300'>
            <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
              {groupRows[0].map(row => renderSeats(row))}
            </div>

            <div className='grid grid-cols-2 gap-12'>
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx}>
                  {group.map(row => renderSeats(row))}
                </div>
              ))}
            </div>
          </div>

          {selectedTime && (
            <p className="text-center text-gray-400 text-sm mt-8">
              {occupiedSeats.length} seats already booked for this show
            </p>
          )}

        </div>
      </div>

      {/* BOTTOM BAR - Booking Summary */}
      {selectedSeats.length > 0 && selectedTime && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl z-50'>

          <div>
            <p className='text-xs text-gray-400'>Selected Seats</p>
            <div className='flex gap-2 flex-wrap'>
              {selectedSeats.map(seat => (
                <span key={seat} className='px-3 py-1 bg-white/5 rounded-lg text-sm font-bold border border-white/10'>
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className='text-xs text-gray-400'>Show Time</p>
            <p className='text-sm font-bold'>{isoTimeFormat(selectedTime.time)}</p>
          </div>

          <div>
            <p className='text-xs text-gray-400'>Total Price</p>
            <p className='text-2xl font-black'>₹{totalPrice}</p>
          </div>

          <button
            onClick={bookTickets}
            disabled={bookingInProgress}
            className='flex items-center gap-2 px-10 py-4 bg-primary text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {bookingInProgress ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay Now
                <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition' />
              </>
            )}
          </button>

        </div>
      )}

    </div>
  )
}

export default SeatLayout