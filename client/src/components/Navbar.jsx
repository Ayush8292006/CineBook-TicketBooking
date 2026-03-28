import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, TicketPlus, XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/react'

const Navbar = () => {
    const [isOpen, setIsopen] = useState(false)
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const navigate = useNavigate()

    return (
        <nav className='fixed top-0 left-0 z-50 w-full'>
            <div className='max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 lg:px-12 py-4'>
                {/* Logo */}
                <Link to='/' className='relative group max-md:flex-1'>
                    <img 
                        src={assets.logo} 
                        alt="CineBook" 
                        className='w-36 h-auto transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full'></div>
                </Link>

                {/* Desktop Navigation */}
                <div className='hidden md:flex items-center gap-8 lg:gap-12'>
                    {['Home', 'Movies', 'Theaters', 'Releases', 'Favorites'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className='relative text-white/80 hover:text-white font-medium transition-all duration-300 group py-2'
                            onClick={() => scrollTo(0, 0)}
                        >
                            {item}
                            <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full'></span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className='hidden md:flex items-center gap-4 lg:gap-6'>
                    {!user ? (
                        <button 
                            onClick={() => openSignIn()} 
                            className='relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dull rounded-full font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95'
                        >
                            <span className='relative z-10'>Sign In</span>
                            <div className='absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300'></div>
                        </button>
                    ) : (
                        <UserButton afterSignOutUrl="/">
                            <UserButton.MenuItems>
                                <UserButton.Action 
                                    label="My Bookings" 
                                    labelIcon={<TicketPlus size={18} />} 
                                    onClick={() => navigate('/my-bookings')}
                                />
                            </UserButton.MenuItems>
                        </UserButton>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className='md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95'
                    onClick={() => setIsopen(!isOpen)}
                >
                    <MenuIcon className='w-5 h-5 text-white' />
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            <div 
                className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-all duration-500 md:hidden ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={() => setIsopen(false)}
            >
                <div 
                    className={`flex flex-col items-center justify-center min-h-screen transform transition-all duration-500 delay-100 ${
                        isOpen ? 'translate-y-0' : '-translate-y-10'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button 
                        className='absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:rotate-90'
                        onClick={() => setIsopen(false)}
                    >
                        <XIcon className='w-6 h-6 text-white' />
                    </button>

                    {/* Mobile Navigation Links */}
                    <div className='flex flex-col items-center gap-6 w-full px-6'>
                        {['Home', 'Movies', 'Theaters', 'Releases', 'Favorites'].map((item, index) => (
                            <Link
                                key={item}
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className='relative text-2xl text-white/80 hover:text-white font-medium py-3 transition-all duration-300 hover:scale-110 group'
                                onClick={() => {
                                    scrollTo(0, 0)
                                    setIsopen(false)
                                }}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: isOpen ? 'slideUp 0.5s ease forwards' : 'none'
                                }}
                            >
                                {item}
                                <span className='absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0'></span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Auth Button */}
                    {!user ? (
                        <button 
                            onClick={() => {
                                openSignIn()
                                setIsopen(false)
                            }}
                            className='mt-12 px-8 py-3 bg-gradient-to-r from-primary to-primary-dull rounded-full font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95'
                        >
                            Sign In
                        </button>
                    ) : (
                        <div className='mt-12'>
                            <UserButton afterSignOutUrl="/">
                                <UserButton.MenuItems>
                                    <UserButton.Action 
                                        label="My Bookings" 
                                        labelIcon={<TicketPlus size={18} />} 
                                        onClick={() => {
                                            navigate('/my-bookings')
                                            setIsopen(false)
                                        }}
                                    />
                                </UserButton.MenuItems>
                            </UserButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Add keyframe animations */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </nav>
    )
}

export default Navbar