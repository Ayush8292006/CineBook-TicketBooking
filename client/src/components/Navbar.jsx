import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, TicketPlus, XIcon, Home, Heart, Calendar } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceAssistant from './VoiceAssistant'

const Navbar = () => {
    const [isOpen, setIsopen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getUserName = () => {
        if (!user) return ''
        return user.fullName || user.firstName || user.username || 'User'
    }

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Movies', path: '/movies', icon: TicketPlus },
        { name: 'Favorites', path: '/favorites', icon: Heart },
        { name: 'My Bookings', path: '/my-bookings', icon: TicketPlus },
    ]

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
                    scrolled 
                        ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' 
                        : 'bg-gradient-to-b from-black/60 to-transparent'
                }`}
            >
                <div className='max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 lg:px-12 py-4'>
                    {/* Logo */}
                    <Link to='/' className='relative group flex-shrink-0'>
                        <img 
                            src={assets.logo} 
                            alt="CineBook" 
                            className='w-40 md:w-40 h-30 transition-all duration-300 group-hover:scale-105'
                        />
                        <div className='absolute -bottom-1 left-0 w-0 h-0.5'></div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center gap-8 lg:gap-10'>
                        {navItems.map((item) => {
                            const active = isActive(item.path)
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className='relative group py-2'
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    <span className={`font-medium text-sm transition-all duration-300 ${
                                        active ? 'text-primary' : 'text-gray-300 hover:text-white'
                                    }`}>
                                        {item.name}
                                    </span>
                                    {active && (
                                        <motion.div 
                                            layoutId="activeNav"
                                            className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dull rounded-full'
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                    {!active && (
                                        <div className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-dull rounded-full transition-all duration-300 group-hover:w-full' />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Desktop Right Section - All items aligned to far right */}
                    <div className='hidden md:flex items-center gap-4'>
                        {/* Auth Section */}
                        {!user ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openSignIn()} 
                                className='px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dull rounded-full font-medium text-black shadow-lg hover:shadow-primary/50 transition-all duration-300'
                            >
                                Sign In
                            </motion.button>
                        ) : (
                            <div className='flex items-center gap-4'>
                                <div className='text-right'>
                                    <p className='text-xs text-gray-400'>Welcome back,</p>
                                    <p className='text-sm font-semibold text-white'>{getUserName()}</p>
                                </div>
                                <UserButton afterSignOutUrl="/">
                                    <UserButton.MenuItems>
                                        <UserButton.Action 
                                            label="My Bookings" 
                                            labelIcon={<TicketPlus size={18} />} 
                                            onClick={() => navigate('/my-bookings')}
                                        />
                                    </UserButton.MenuItems>
                                </UserButton>
                            </div>
                        )}
                        
                        {/* Voice Assistant - Positioned at far right */}
                        <div className="ml-2">
                            <VoiceAssistant isNavbar={true} />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className='flex items-center gap-3 md:hidden'>
                        {/* Voice Assistant for Mobile */}
                        <VoiceAssistant isNavbar={true} />
                        
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className='relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300'
                            onClick={() => setIsopen(!isOpen)}
                        >
                            <MenuIcon className='w-5 h-5 text-white' />
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/98 backdrop-blur-2xl z-50 md:hidden'
                        onClick={() => setIsopen(false)}
                    >
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className='flex flex-col items-center justify-center min-h-screen'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <motion.button 
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className='absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300'
                                onClick={() => setIsopen(false)}
                            >
                                <XIcon className='w-6 h-6 text-white' />
                            </motion.button>

                            {/* Logo in Mobile */}
                            <div className='absolute top-6 left-6'>
                                <img src={assets.logo} alt="CineBook" className='w-28 h-auto' />
                            </div>

                            {/* Mobile Navigation Links */}
                            <div className='flex flex-col items-center gap-8 w-full px-6'>
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            to={item.path}
                                            className='group flex items-center gap-3 text-2xl text-gray-400 hover:text-white font-medium py-2 transition-all duration-300'
                                            onClick={() => {
                                                window.scrollTo(0, 0)
                                                setIsopen(false)
                                            }}
                                        >
                                            <item.icon className="w-6 h-6 group-hover:text-primary transition-colors" />
                                            <span className='group-hover:translate-x-1 transition'>{item.name}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mobile Auth Section */}
                            {!user ? (
                                <motion.button 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        openSignIn()
                                        setIsopen(false)
                                    }}
                                    className='mt-12 px-8 py-3 bg-gradient-to-r from-primary to-primary-dull rounded-full font-medium text-black shadow-lg hover:shadow-primary/50 transition-all duration-300'
                                >
                                    Sign In
                                </motion.button>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className='mt-12 text-center'
                                >
                                    <p className='text-white text-lg'>Welcome back, <span className='text-primary font-semibold'>{getUserName()}</span></p>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navbar