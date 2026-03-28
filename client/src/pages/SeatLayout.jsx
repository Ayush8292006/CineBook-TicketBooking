import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'

const SeatLayout = () => {

  const groupRows = [["A","B"],["C","D"],["E","F"],["G","H"],["I","J"]]

  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)

  const navigate = useNavigate()

  const seatPrice = show?.movie?.price || 200 // dummy price

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData
      })
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error("Please select time first")
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast.error("You can only select 5 seats")
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex items-center gap-4 mt-3">
      <span className="text-xs text-gray-500 w-4">{row}</span>

      <div className="flex gap-3">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isSelected = selectedSeats.includes(seatId)

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`
                relative h-10 w-10 rounded-xl flex items-center justify-center
                text-[10px] font-semibold transition-all duration-300
                
                ${isSelected
                  ? "bg-primary text-black scale-110 shadow-[0_0_20px_rgba(var(--primary-rgb),0.7)]"
                  : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 text-gray-400 hover:text-primary hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:-translate-y-1"
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

  useEffect(() => {
    getShow()
  }, [])

  const totalPrice = selectedSeats.length * seatPrice

  return show ? (
    <div className='min-h-screen bg-[#020202] text-white pt-40 pb-32 px-6 md:px-16 lg:px-24 relative overflow-hidden'>

      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle bottom='0px' right='0px' />

      <div className='max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-16'>

        {/* LEFT PANEL */}
        <div className='w-72 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl py-8 h-max md:sticky md:top-32 shadow-xl'>

          {/* 🎬 MOVIE TITLE */}
          <div className='px-6 mb-6 border-l-4 border-primary'>
            <h2 className='text-2xl font-black tracking-tight'>
              {show.movie.title}
            </h2>
            <p className='text-xs text-gray-400 uppercase tracking-widest mt-1'>
              Choose Timing
            </p>
          </div>

          <div className='space-y-3 px-4'>
            {show.dateTime[date].map((item) => (
              <div
                key={item.time}
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
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className='flex-1 flex flex-col items-center max-md:mt-16'>

          <h1 className='text-3xl font-black mb-6 tracking-tight'>
            Select Your Seat
          </h1>

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

        </div>
      </div>

      {/* 💰 BOTTOM BAR */}
      {selectedSeats.length > 0 && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl'>

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
            <p className='text-xs text-gray-400'>Total Price</p>
            <p className='text-2xl font-black'>₹{totalPrice}</p>
          </div>

          <button
            onClick={() => navigate('/my-bookings')}
            className='flex items-center gap-2 px-10 py-4 bg-primary text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition shadow-lg group'
          >
            Pay Now
            <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition' />
          </button>

        </div>
      )}

    </div>
  ) : <Loading />
}

export default SeatLayout