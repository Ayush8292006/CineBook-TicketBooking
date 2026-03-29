import express from "express";
import {
  createBooking,
  getOccupiedSeats
//   getUserBookings,
//   cancelBooking,
//   confirmPayment
} from "../controllers/bookingController.js";

// import { requireAuth } from "@clerk/express";

const bookingRouter = express.Router();

bookingRouter.post("/create",createBooking);
bookingRouter.get("/seats/:showId",getOccupiedSeats);


// router.post("/confirm/:bookingId", requireAuth(), confirmPayment); // ✅ NEW
// router.get("/user", requireAuth(), getUserBookings);
// router.delete("/cancel/:bookingId", requireAuth(), cancelBooking);

export default bookingRouter;