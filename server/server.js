import express from 'express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import cors from 'cors'
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware, getAuth } from '@clerk/express'
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import User from './models/User.js';

const app = express();
const port = 3000;

await connectDB()

// CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// DEBUG MIDDLEWARE
app.use((req, res, next) => {
  console.log("📢", req.method, req.url);
  next();
});

// Clerk middleware
app.use(clerkMiddleware());

// Debug middleware to check auth
app.use((req, res, next) => {
  const auth = getAuth(req);
  console.log("🔍 Auth userId:", auth?.userId || "No user");
  next();
});

// DEBUG ROUTES
app.get('/debug/auth', (req, res) => {
  const auth = getAuth(req);
  res.json({
    hasAuth: !!auth?.userId,
    userId: auth?.userId,
    sessionId: auth?.sessionId,
    headers: req.headers.authorization?.substring(0, 50) || "No auth header"
  });
});

app.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      total: users.length,
      users: users.map(u => ({
        id: u._id,
        email: u.email,
        name: u.name,
        isAdmin: u.isAdmin
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/debug/make-admin', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    
    let user = await User.findOne({ _id: userId });
    
    if (!user) {
      user = new User({
        _id: userId,
        name: name || "Admin User",
        email: email || "admin@example.com",
        image: "",
        isAdmin: true
      });
      await user.save();
      res.json({ success: true, message: "User created as admin", user });
    } else {
      user.isAdmin = true;
      await user.save();
      res.json({ success: true, message: "User updated to admin", user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

console.log("📋 Registering routes...");
console.log("  - /api/user router:", userRouter ? "YES" : "NO");
console.log("  - userRouter stack:", userRouter?.stack?.length || 0);

// ✅ API ROUTES
app.use('/api/inngest', serve({client: inngest, functions}))
app.use('/api/admin', adminRouter)
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/user', userRouter)

// ✅ Home route
app.get('/', (req, res) => res.send('Server is Live'));

app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});