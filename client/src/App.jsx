import React from 'react'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import AboutUs from './pages/AboutUs'
import Legal from './pages/Legal'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListBookings from './pages/admin/ListBookings'
import ListShows from './pages/admin/ListShows'
import { useAppContext } from './context/AppContext'
import { SignIn } from '@clerk/react'
import Loading from './components/Loading'

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, isCheckingAdmin } = useAppContext()
  
  if (isCheckingAdmin) {
    return <Loading />
  }
  
  if (!user) {
    return (
      <div className='min-h-screen flex justify-center items-center'>
        <SignIn fallbackRedirectUrl={'/admin'} />
      </div>
    )
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const { user } = useAppContext()
  
  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorites' element={<Favorite />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/legal' element={<Legal />} />

        {/* Admin Routes with Protection */}
        <Route 
          path='/admin/*' 
          element={
            <ProtectedAdminRoute>
              <Layout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='add-shows' element={<AddShows />} />
          <Route path='list-shows' element={<ListShows />} />
          <Route path='list-bookings' element={<ListBookings />} />
        </Route>
      </Routes>
      
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App