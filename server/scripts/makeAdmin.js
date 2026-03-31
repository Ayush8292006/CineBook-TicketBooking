import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.js';

const makeAdmin = async (userId) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database connected");
    
    // ✅ Use findOneAndUpdate with proper options
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isAdmin: true } },
      { new: true, upsert: true }  // upsert: create if doesn't exist
    );
    
    console.log(`✅ User ${userId} is now admin`);
    console.log("User details:", user);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

const userId = process.argv[2];
if (!userId) {
  console.log("Usage: node makeAdmin.js <userId>");
  console.log("Example: node makeAdmin.js user_3Bg914cgE4EfKcOFyR1AZ3cQ9sK");
  process.exit(1);
}

makeAdmin(userId);