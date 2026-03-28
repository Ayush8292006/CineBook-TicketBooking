import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title'; 
import { dateFormat } from '../../lib/dateFormate';

const ListBooking = () => {

  const currency = import.meta.env.VITE_CURRENCY

  const [bookings, setBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    setBookings(dummyBookingData)
    setIsLoading(false)
  }

  useEffect(() => {
    getAllBookings();
  }, []);

  return !isLoading ? (
    <div className="animate-in fade-in duration-700">

      <Title text1="List" text2="Bookings" /> 

      <div className='max-w-5xl mt-8 overflow-x-auto bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-md shadow-xl'>

        <table className='w-full text-left border-separate border-spacing-0'>

          {/* HEADER */}
          <thead>
            <tr className="bg-white/[0.05] text-gray-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Movie</th>
              <th className="px-6 py-4">Show Time</th>
              <th className="px-6 py-4">Seats</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-white/[0.05] text-sm">

            {bookings.map((item, index) => {

              // handle both array / object seats
              const seats = Array.isArray(item.bookedSeats)
                ? item.bookedSeats
                : Object.values(item.bookedSeats);

              return (
                <tr 
                  key={index} 
                  className="group hover:bg-primary/[0.05] transition-all duration-300"
                >

                  {/* USER */}
                  <td className="px-6 py-4 font-medium text-white">
                    {item.user?.name || "Guest"}
                  </td>

                  {/* MOVIE */}
                  <td className="px-6 py-4 text-gray-300">
                    {item.show.movie.title}
                  </td>

                  {/* TIME */}
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {dateFormat(item.show.showDateTime)}
                  </td>

                  {/* SEATS */}
                  <td className="px-6 py-4">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs">
                      {seats.join(", ")}
                    </span>
                  </td>

                  {/* AMOUNT */}
                  <td className="px-6 py-4 text-right font-bold text-white">
                    {currency}{item.amount}
                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

        {/* EMPTY STATE */}
        {bookings.length === 0 && (
          <div className="py-20 text-center text-gray-500 text-sm">
            No bookings found
          </div>
        )}

      </div>
    </div>
  ) : <Loading />
}

export default ListBooking