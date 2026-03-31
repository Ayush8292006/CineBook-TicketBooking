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
import { stripeWebhook } from './controllers/stripeWebhooks.js';

const app = express();
const port = process.env.PORT || 3000;

// Database connection
await connectDB();

// ==================== STRIPE WEBHOOK ====================
// Must be BEFORE express.json() for raw body
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// ==================== CORS ====================
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, 'https://cinebook.vercel.app']  // Production URLs
  : ['http://localhost:5173', 'http://localhost:5000'];        // Development URLs

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ==================== MIDDLEWARE ====================
app.use(express.json());

// Debug middleware (remove in production or keep for logging)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("📢", req.method, req.url);
  }
  next();
});

// Clerk authentication
app.use(clerkMiddleware());

// Auth debug (remove in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    const auth = getAuth(req);
    console.log("🔍 Auth userId:", auth?.userId || "No user");
  }
  next();
});

// ==================== DEBUG ROUTES (Development Only) ====================
if (process.env.NODE_ENV !== 'production') {
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
}

// ==================== API ROUTES ====================
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/admin', adminRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/user', userRouter);

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== HOME ROUTE ====================
app.get('/', (req, res) => res.send('Server is Live'));

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.url}` 
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});