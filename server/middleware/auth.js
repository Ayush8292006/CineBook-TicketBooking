import { getAuth } from "@clerk/express";
import User from '../models/User.js'; // ✅ YEH IMPORT ADD KARO

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      console.log("❌ No userId found in request");
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please log in" 
      });
    }

    // ✅ YEH PURA BLOCK CHANGE KARO - Database se check karo
    const user = await User.findOne({ _id: userId });
    
    if (!user || !user.isAdmin) {
      console.log("❌ User is not admin:", userId);
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: Admin role required" 
      });
    }

    req.auth = { userId, user };
    next();
  } catch (error) {
    console.error("Admin check error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};