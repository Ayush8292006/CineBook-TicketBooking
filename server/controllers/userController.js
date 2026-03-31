import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

// Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    console.log("📖 getUserBookings - userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please log in" 
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
    console.error("getUserBookings error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Favorite Movies
export const updateFavorite = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    console.log("❤️ updateFavorite - userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please log in" 
      });
    }

    const { movieId } = req.body;
    console.log("🎬 updateFavorite - movieId:", movieId);

    if (!movieId) {
      return res.status(400).json({ 
        success: false, 
        message: "Movie ID required" 
      });
    }

    const user = await clerkClient.users.getUser(userId);
    let favorites = user.privateMetadata?.favorites || [];

    let isAdding = false;
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
      isAdding = true;
      console.log("✅ Added to favorites");
    } else {
      favorites = favorites.filter(item => item !== movieId);
      console.log("✅ Removed from favorites");
    }

    await clerkClient.users.updateUser(userId, {
      privateMetadata: { favorites }
    });

    res.json({ 
      success: true, 
      message: isAdding ? "Added to favorites" : "Removed from favorites",
      isFavorite: isAdding
    });
  } catch (error) {
    console.error("updateFavorite error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get Favorite Movies
export const getFavorites = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    console.log("📋 getFavorites - userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please log in" 
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata?.favorites || [];

    console.log("📋 getFavorites - favorite IDs:", favorites);

    const movies = await Movie.find({ _id: { $in: favorites } });

    console.log("📋 getFavorites - movies found:", movies.length);
    
    res.json({ success: true, movies });
  } catch (error) {
    console.error("getFavorites error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};