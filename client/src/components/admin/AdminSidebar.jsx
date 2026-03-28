import React from 'react'
import { assets } from '../../assets/assets'
import { 
  LayoutDashboard, 
  PlusSquare, 
  List, 
  Ticket, 
  ChevronRight 
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const AdminSidebar = () => {
  // Ideally, context se user data fetch karein
  const user = {
    name: 'Admin User',
    role: 'Super Admin',
    imageUrl: assets.profile_img || assets.profile, 
  }

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquare },
    { name: 'List Shows', path: '/admin/list-shows', icon: List },
    { name: 'Bookings', path: '/admin/list-bookings', icon: Ticket },
  ]

  return (
    <div className='h-[calc(100vh-80px)] sticky top-20 flex flex-col items-center pt-10 w-20 md:w-72 border-r border-white/10 bg-black/20 backdrop-blur-lg transition-all duration-500'>
      
      {/* 👤 Profile Section */}
      <div className='flex flex-col items-center group mb-10'>
        <div className='relative p-1 rounded-2xl bg-gradient-to-tr from-primary/50 to-transparent'>
          <img 
            src={user.imageUrl} 
            alt="Admin" 
            className='h-12 w-12 md:h-16 md:w-16 rounded-xl object-cover border-2 border-black shadow-2xl transition-transform group-hover:scale-105' 
          />
          <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg shadow-green-500/20'></div>
        </div>
        <div className='mt-4 text-center hidden md:block animate-in fade-in slide-in-from-top-2'>
          <p className='text-sm font-black text-white tracking-wide'>{user.name}</p>
          <p className='text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-0.5 opacity-80'>{user.role}</p>
        </div>
      </div>

      {/* 🔗 Navigation Links */}
      <div className='w-full space-y-2 px-3'>
        {adminNavLinks.map((link, index) => (
          <NavLink 
            key={index} 
            to={link.path} 
            end
            className={({ isActive }) =>
              `group relative flex items-center gap-4 w-full py-3.5 px-4 md:px-6 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(20,184,166,0.05)]' 
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                
                <span className='hidden md:block text-sm font-bold tracking-tight'>
                  {link.name}
                </span>

                {/* Active Indicator Pillar */}
                {isActive && (
                  <>
                    <div className='absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[4px_0_15px_rgba(20,184,166,0.8)]' />
                    <ChevronRight className='hidden md:block absolute right-4 w-4 h-4 opacity-50' />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* 💡 Sidebar Footer (Optional) */}
      <div className='mt-auto pb-8 hidden md:block'>
        <p className='text-[10px] text-gray-600 font-bold uppercase tracking-widest'>CineBook v1.0.4</p>
      </div>

    </div>
  )
}

export default AdminSidebar