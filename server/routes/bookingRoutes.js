import express from "express";
import {
  createBooking,
  getOccupiedSeats
} from "../controllers/bookingController.js";
import { requireAuth } from "@clerk/express";

const bookingRouter = express.Router();

// Test routes
bookingRouter.get('/test', (req, res) => {
  res.json({ success: true, message: "Booking router is working!" });
});

// ✅ FIXED: Call req.auth() as function
bookingRouter.get('/check-auth', requireAuth(), (req, res) => {
  const auth = req.auth();  // Call as function!
  console.log("🔍 Check-auth - auth():", auth);
  res.json({ 
    success: true, 
    userId: auth?.userId,
    message: "Auth is working!"
  });
});

// Main routes with authentication
bookingRouter.post("/create", requireAuth(), createBooking);
bookingRouter.get("/seats/:showId", requireAuth(), getOccupiedSeats);

console.log("✅ bookingRoutes loaded");

export default bookingRouter;