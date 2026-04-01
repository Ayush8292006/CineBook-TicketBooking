import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

// Check seat availability
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};
    const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.log("checkSeatAvailability error:", error.message);
    return false;
  }
};

// CREATE BOOKING WITH STRIPE
export const createBooking = async (req, res) => {
  try {
    console.log("=" .repeat(50));
    console.log("📝 CREATE BOOKING CALLED");
    
    // Get userId from auth
    const auth = req.auth();
    const userId = auth?.userId;
    console.log("👤 User ID from auth:", userId);
    
    if (!userId) {
      console.log("❌ No userId found - Unauthorized");
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please log in" 
      });
    }
    
    const { showId, seats, selectedSeats, totalPrice } = req.body;
    const seatArray = seats || selectedSeats;
    
    console.log("🎬 Show ID:", showId);
    console.log("💺 Seats:", seatArray);
    console.log("💰 Total Price:", totalPrice);
    
    // Validation
    if (!showId) {
      return res.status(400).json({ 
        success: false, 
        message: "Show ID required" 
      });
    }
    
    if (!seatArray || seatArray.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please select at least one seat" 
      });
    }
    
    if (seatArray.length > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "You can only book up to 5 seats" 
      });
    }
    
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.status(404).json({ 
        success: false, 
        message: "Show not found" 
      });
    }
    
    // Check seat availability
    const isAvailable = await checkSeatAvailability(showId, seatArray);
    if (!isAvailable) {
      return res.status(409).json({ 
        success: false, 
        message: "Some seats are already booked. Please select different seats." 
      });
    }
    
    const amount = totalPrice || (showData.showPrice * seatArray.length);
    
    //  Create booking FIRST
    const booking = await Booking.create({
      user: userId,
      show: showId,
      bookedSeats: seatArray,
      amount: amount,
      isPaid: false  // Set to false until payment is completed
    });
    
    console.log(" Booking created:", booking._id);
    
    //  Update occupied seats
    seatArray.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });
    
    showData.markModified('occupiedSeats');
    await showData.save();
    
    console.log(" Show updated with occupied seats");
    
    //  STRIPE PAYMENT GATEWAY
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get origin from headers
    const origin = req.headers.origin || 'http://localhost:5173';
    
    // Create line items for stripe
    const line_items = [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: showData.movie.title,
          description: `Seats: ${seatArray.join(", ")} | Show: ${new Date(showData.showDateTime).toLocaleString()}`,
        },
        unit_amount: Math.floor(amount) * 100  
      },
      quantity: 1,
    }];

    console.log(" Creating Stripe session with:");
console.log("   Success URL:", `${origin}/my-bookings?success=true&bookingId=${booking._id}`);
console.log("   Cancel URL:", `${origin}/my-bookings?canceled=true`);
    
    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-bookings?success=true&bookingId=${booking._id}`,
      cancel_url: `${origin}/my-bookings?canceled=true`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        bookingId: booking._id.toString(),
        userId: userId,
        showId: showId,
        seats: seatArray.join(",")
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiry
    });
    
    // Update booking with payment link
    booking.paymentLink = session.url;
    await booking.save();
    
    console.log(" Stripe session created:", session.id);
    console.log("=" .repeat(50));

    // run inngest shedular function to release seats if not paid in 10 minutes
    await inngest.send({
      name: 'app/checkpayment',
      data: { bookingId: booking._id.toString() }
    })
    
    res.json({
      success: true,
      message: "Booking created! Redirect to payment.",
      url: session.url,
      bookingId: booking._id
    });
    
  } catch (error) {
    console.error("❌ Create booking error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// GET OCCUPIED SEATS
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    console.log("📋 Getting occupied seats for show:", showId);
    
    const showData = await Show.findById(showId);
    if (!showData) {
      return res.status(404).json({ 
        success: false, 
        message: "Show not found" 
      });
    }
    
    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    console.log("📋 Occupied seats:", occupiedSeats);
    
    res.json({ 
      success: true, 
      occupiedSeats 
    });
  } catch (error) {
    console.error("Get occupied seats error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

