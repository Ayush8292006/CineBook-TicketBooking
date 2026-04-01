import User from '../models/User.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// ✅ FIXED: Actually check from database
export const isAdmin = async (req, res) => {
  try {
    const { userId } = req.auth;
    
    if (!userId) {
      return res.json({ success: true, isAdmin: false });
    }
    
    const user = await User.findOne({ _id: userId });
    
    res.json({ 
      success: true, 
      isAdmin: user?.isAdmin === true 
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ success: false, message: error.message, isAdmin: false });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie');
    const bookings = await Booking.find({ isPaid: true });

    const totalUser = await User.countDocuments();

    // ✅ FIX: Use 'amount' instead of 'totalPrice'
    const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.amount || 0), 0);

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: totalRevenue,
      totalUser,
      activeShows
    }

    console.log("Dashboard Data:", dashboardData); // Debug log

    res.json({
      success: true,
      dashboardData
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate('movie')
      .sort({ showDateTime: 1 });
      
    res.json({
      success: true,
      shows
    });
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user')
      .populate({
        path: 'show',
        populate: { path: 'movie' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};