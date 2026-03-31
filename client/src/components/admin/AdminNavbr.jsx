import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <nav className='flex items-center justify-between px-8 md:px-16 h-24 bg-black/20 backdrop-blur-md border-b border-white/5'>
      
      {/* 🎬 Logo Section */}
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={assets.logo} alt="CineBook" className='w-40 h-auto filter brightness-110'/>
      </Link>

      {/* ✍️ Attractive Heading */}
      <div className='flex flex-col items-end'>
        <h1 className='text-xl md:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/50 uppercase'>
          Control Center
        </h1>
        <div className='h-1 w-12 bg-primary rounded-full -mt-1 shadow-[0_0_10px_rgba(20,184,166,0.5)]'></div>
      </div>

    </nav>
  )
}

export default AdminNavbar