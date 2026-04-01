import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';

const makeAdmin = async (userId) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");
    
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isAdmin: true } },
      { new: true, upsert: true }
    );
    
    console.log(`✅ Admin privileges granted to ${userId}`);
    console.log("User:", user);
    process.exit(0);
  } catch (error) {
    console.error(" Failed to update user:", error.message);
    process.exit(1);
  }
};

const userId = process.argv[2];
if (!userId) {
  console.log("Usage: npm run make-admin <user-id>");
  console.log("Example: npm run make-admin user_123abc");
  process.exit(1);
}

makeAdmin(userId);