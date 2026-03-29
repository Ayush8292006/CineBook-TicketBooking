import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    console.log("AUTH:", req.auth); // debug

    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not Admin" });
    }

    next();
  } catch (error) {
    console.log("Admin Error:", error);
    res.status(500).json({ success: false });
  }
};