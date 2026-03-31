import React, { useEffect, useState } from 'react'
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
  Calendar,
  TrendingUp
} from 'lucide-react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { dateFormat } from '../../lib/dateFormate'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext';

const Dashboard = () => {

  const { axios, getToken, user,image_base_url, backendUrl } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0
  })

  const [loading, setLoading] = useState(true)

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings.toLocaleString() || "0",
      icon: ChartLineIcon,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400"
    },
    {
      title: "Revenue",
      value: `${currency}${dashboardData.totalRevenue.toLocaleString() || 0}`,
      icon: CircleDollarSignIcon,
      color: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400"
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
      color: "from-amber-500/20 to-amber-600/5",
      iconColor: "text-amber-400"
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400"
    }
  ]

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      if (!token) {
        toast.error("Please login again")
        setLoading(false)
        return
      }
      
      // ✅ FIX: Use backendUrl
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message || "Failed to load dashboard data.")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error(error.response?.data?.message || "Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Title text1="Analytics" text2="Overview" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <BlurCircle top="-50px" left="10%" />
        
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden group p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40`}
          >
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-200 transition-colors">
                  {card.title}
                </p>
                <h2 className="text-3xl font-black mt-2 tracking-tight text-white">
                  {card.value}
                </h2>
              </div>
              <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${card.iconColor}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <TrendingUp className="absolute -bottom-2 -right-2 w-24 h-24 text-white opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" />
          </div>
        ))}
      </div>

      {/* Active Shows Section */}
      <div className="mt-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayCircleIcon className="text-primary w-6 h-6" />
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Live Productions</h2>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-6 hidden md:block"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {dashboardData.activeShows.length > 0 ? (
          dashboardData.activeShows.map((show) => (
            <div 
              key={show._id} 
              className="group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={image_base_url+show.movie.poster_path} 
                  alt={show.movie.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-3 right-3 bg-primary text-black font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                  {currency}{show.showPrice}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm truncate text-white group-hover:text-primary transition-colors">
                  {show.movie.title}
                </h3>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <StarIcon className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-xs font-bold text-gray-300">
                      {show.movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {dateFormat(show.showDateTime).split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No active shows found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard