import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormate';

import { Film, Calendar, Users, IndianRupee, Hash } from 'lucide-react';
import { dummyShowsData } from '../../assets/assets';

const ListShows = () => {

  const currency = import.meta.env.VITE_CURRENCY
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const TOTAL_SEATS = 50; // for progress bar

  const getAllShows = async () => {
    try {
      setShows([
        {
          _id: "show123456",
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
            D1: "user_4",
          }
        }
      ]);
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getAllShows();
  }, []);

  return !loading ? (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      <Title text1="Production" text2="Inventory" />

      <div className="mt-8 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">

            {/* HEADER */}
            <thead>
              <tr className="bg-white/[0.05]">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Film className="w-3 h-3 text-primary" /> Movie
                  </div>
                </th>

                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" /> Timing
                  </div>
                </th>

                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-3 h-3 text-primary" /> Seats
                  </div>
                </th>

                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <IndianRupee className="w-3 h-3 text-primary" /> Revenue
                  </div>
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-white/[0.05]">
              {shows.map((show, index) => {

                const bookingCount = Object.keys(show.occupiedSeats).length;
                const earnings = bookingCount * show.showPrice;
                const percentage = (bookingCount / TOTAL_SEATS) * 100;

                return (
                  <tr
                    key={index}
                    className="group hover:bg-primary/[0.05] transition-all duration-300"
                  >

                    {/* MOVIE */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition">
                          {show.movie.title}
                        </span>

                        <span className="text-[10px] text-gray-500 uppercase mt-1">
                          ID: {show._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* TIME */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-300">
                          {dateFormat(show.showDateTime).split('at')[0]}
                        </span>
                        <span className="text-[10px] text-primary font-bold">
                          {dateFormat(show.showDateTime).split('at')[1]}
                        </span>
                      </div>
                    </td>

                    {/* SEATS + PROGRESS */}
                    <td className="px-6 py-5 text-center">

                      <div className="flex flex-col items-center gap-2">

                        <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          {bookingCount}/{TOTAL_SEATS}
                        </span>

                        {/* progress bar */}
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>

                        {/* status */}
                        <span className={`text-[9px] font-bold uppercase ${
                          percentage > 80 ? "text-red-400" : "text-green-400"
                        }`}>
                          {percentage > 80 ? "Almost Full" : "Available"}
                        </span>

                      </div>
                    </td>

                    {/* REVENUE */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-white">
                          {currency}{earnings.toLocaleString()}
                        </span>

                        <span className="text-[9px] text-gray-500">
                          Price: {currency}{show.showPrice}
                        </span>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>

          </table>
        </div>

        {/* EMPTY */}
        {shows.length === 0 && (
          <div className="py-24 text-center">
            <Hash className="w-8 h-8 text-primary/40 mx-auto mb-4" />
            <p className="text-gray-500 text-xs uppercase">
              No shows found
            </p>
          </div>
        )}

      </div>
    </div>
  ) : <Loading />
}

export default ListShows