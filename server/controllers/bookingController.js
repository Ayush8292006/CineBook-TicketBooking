import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Check seat availability
const checkSeatAvailability = async (showId, selectedSeats) => {
 try{
    await Show.findById(showId)
    if(!showData) return false;

    const occupiedSeats = showData.occupiedSeats;

    const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);

    return !isAnySeatTaken;
 }catch(error){
    console.log(error.message)
    return false;
 }
};

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { showId, selectedSeats } = req.body;
    const {userId} = req.auth();
    const {origin} = req.headers;

    const isAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.status(409).json({ success: false, message: "Seats already booked" });
    }

    const showData = await Show.findById(showId).populate("movie");

  

    const booking = await Booking.create({
      user: userId,
      show: showId,
      bookedSeats: selectedSeats,
      amount: showData.showPrice * selectedSeats.length
     
    });

    selectedSeats.map((seat)=>{
        showData.occupiedSeats[seat] = userId;
    })

    showData.markModified('occupiedSeats')

    await showData.save();

    // stripe gateway



    res.json({
      success: true,
      message: 'Booked successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async(req,res)=> {
    try{
        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)
        res.json({success:true, occupiedSeats})



    }catch(error){
            res.status(500).json({ success: false, message: error.message });
    }
}

// // CONFIRM PAYMENT (Frontend payment page ke baad call hoga)
// export const confirmPayment = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const userId = req.auth().userId;

//     const booking = await Booking.findById(bookingId);

//     if (!booking) {
//       return res.status(404).json({ success: false });
//     }

//     if (booking.user.toString() !== userId) { // ✅ FIXED
//       return res.status(403).json({ success: false });
//     }

//     if (booking.isPaid) {
//       return res.status(400).json({ success: false, message: "Already paid" });
//     }

//     booking.isPaid = true;
//     await booking.save();

//     await Show.findByIdAndUpdate(booking.show, {
//       $addToSet: { occupiedSeats: { $each: booking.bookedSeats } }
//     });

//     res.json({ success: true, message: "Payment success" });

//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// // GET USER BOOKINGS
// export const getUserBookings = async (req, res) => {
//   try {
//     const userId = req.auth().userId;

//     const bookings = await Booking.find({ user: userId })
//       .populate({
//         path: "show",
//         populate: { path: "movie" }
//       })
//       .sort({ createdAt: -1 });

//     res.json({ success: true, bookings });

//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };

// // CANCEL BOOKING
// export const cancelBooking = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const userId = req.auth().userId;

//     const booking = await Booking.findById(bookingId);

//     if (!booking) return res.status(404).json({ success: false });

//     if (booking.user.toString() !== userId) {
//       return res.status(403).json({ success: false });
//     }

//     if (booking.isPaid) {
//       await Show.findByIdAndUpdate(booking.show, {
//         $pull: { occupiedSeats: { $in: booking.bookedSeats } }
//       });
//     }

//     await Booking.findByIdAndDelete(bookingId);

//     res.json({ success: true });

//   } catch (error) {
//     res.status(500).json({ success: false });
//   }
// };