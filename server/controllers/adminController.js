import Booking from "../models/Booking.js"
import Show from "../models/Show.js"
import User from "../models/User.js"

export const isAdmin = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      isAdmin: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// api to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true })
        const activeShows = await Show.find({
            showDateTime: { $gte: new Date() }
        }).populate('movie')

        const totalUser = await User.countDocuments()

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({ success: true, dashboardData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const getAllShows = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const shows = await Show.find({
            showDateTime: { $gte: startOfToday }
        })
        .populate('movie')
        .sort({ showDateTime: 1 });

        console.log("Total shows:", shows.length);

        if (shows.length === 0) {
            return res.json({
                success: true,
                shows: [],
                message: "No shows available"
            });
        }

        res.json({
            success: true,
            count: shows.length,
            shows
        });

    } catch (error) {
        console.log("Error in getAllShows:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// api to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user')
            .populate({
                path: "show",
                populate: { path: "movie" }
            })
            .sort({ createdAt: -1 })

        res.json({ success: true, bookings })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}