import express from "express";
import {
  createBooking,
  getOccupiedSeats
} from "../controllers/bookingController.js";
import { requireAuth } from "@clerk/express";
import Booking from "../models/Booking.js"; 

const bookingRouter = express.Router();

// Test routes
bookingRouter.get('/test', (req, res) => {
  res.json({ success: true, message: "Booking router is working!" });
});


bookingRouter.get('/check-auth', requireAuth(), (req, res) => {
  const auth = req.auth();  // Call as function!
  console.log("🔍 Check-auth - auth():", auth);
  res.json({ 
    success: true, 
    userId: auth?.userId,
    message: "Auth is working!"
  });
});


bookingRouter.post("/update/:bookingId", requireAuth(), async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { isPaid } = req.body;
        
        console.log("📝 Updating booking:", bookingId, "isPaid:", isPaid);
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId, 
            { isPaid: isPaid },
            { new: true }
        );
        
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Main routes with authentication
bookingRouter.post("/create", requireAuth(), createBooking);
bookingRouter.get("/seats/:showId", requireAuth(), getOccupiedSeats);

console.log(" bookingRoutes loaded");

export default bookingRouter;