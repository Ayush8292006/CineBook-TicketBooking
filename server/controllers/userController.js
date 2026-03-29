import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// API CONTROLLER FUNCTION TO GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    // ✅ FIXED - req.auth is an object, not a function
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: User ID not found" 
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API CONTROLLER FUNCTION TO UPDATE FAVORITE MOVIE
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ 
        success: false, 
        message: "Movie ID is required" 
      });
    }

    // ✅ FIXED - req.auth is an object, not a function
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: User ID not found" 
      });
    }

    const user = await clerkClient.users.getUser(userId);

    if (!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = [];
    }

    if (!user.privateMetadata.favorites.includes(movieId)) {
      user.privateMetadata.favorites.push(movieId);
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
        (item) => item !== movieId
      );
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res.json({ success: true, message: "Favorite movies updated." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API CONTROLLER FUNCTION TO GET FAVORITE MOVIES
export const getFavorites = async (req, res) => {
  try {
    // ✅ FIXED - req.auth is an object, not a function
    const userId = req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: User ID not found" 
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};