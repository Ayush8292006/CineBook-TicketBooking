import express from 'express';
import { requireAuth } from "@clerk/express"; // 👈 IMPORTANT
import { protectAdmin } from '../middleware/auth.js';

import {
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// ✅ FIX: requireAuth() ADD KIYA
adminRouter.get('/is-admin', requireAuth(), protectAdmin, isAdmin);
adminRouter.get('/dashboard', requireAuth(), protectAdmin, getDashboardData);
adminRouter.get('/all-shows', requireAuth(), protectAdmin, getAllShows);
adminRouter.get('/all-bookings', requireAuth(), protectAdmin, getAllBookings);

export default adminRouter;