import express from "express";
import { requireAuth } from "@clerk/express";
import { protectAdmin } from "../middleware/auth.js";
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from "../controllers/adminController.js";
import User from '../models/User.js';  // ✅ Add this import

const adminRouter = express.Router();

//  TEST ROUTE - Public (no auth)
adminRouter.get('/test', (req, res) => {
  res.json({ message: "✅ Admin router is working!", timestamp: new Date() });
});


adminRouter.get('/public-is-admin', async (req, res) => {
  try {
    // Get user ID from query or use your user ID
    const userId = req.query.userId || 'user_3BcgVIEC2QXfIlMAKUrqbiJdlRF';
    const user = await User.findOne({ _id: userId });
    res.json({ 
      success: true, 
      isAdmin: user?.isAdmin === true,
      userId: userId,
      userFound: user ? true : false
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Admin routes
adminRouter.get('/is-admin', requireAuth(), isAdmin);
adminRouter.get('/dashboard', getDashboardData);
adminRouter.get('/all-shows', getAllShows);
adminRouter.get('/all-bookings', getAllBookings);

console.log(" Admin routes LOADED");

export default adminRouter;