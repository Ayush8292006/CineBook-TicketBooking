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

// Connect to MongoDB
await connectDB();

// Stripe webhook needs raw body - must come before express.json()
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Allow all in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Clerk authentication
app.use(clerkMiddleware());

// Attach userId to request for convenience
app.use((req, res, next) => {
  const auth = getAuth(req);
  req.userId = auth?.userId;
  next();
});

// Development helpers
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/auth', (req, res) => {
    res.json({ userId: req.userId });
  });

  app.get('/debug/users', async (req, res) => {
    const users = await User.find({}).select('-__v');
    res.json(users);
  });

  app.post('/debug/make-admin', async (req, res) => {
    const { userId, email, name } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    let user = await User.findOne({ _id: userId });
    
    if (!user) {
      user = new User({
        _id: userId,
        name: name || 'Admin User',
        email: email || 'admin@cinebook.com',
        isAdmin: true
      });
      await user.save();
      return res.json({ message: 'Admin user created', user });
    }
    
    user.isAdmin = true;
    await user.save();
    res.json({ message: 'User is now admin', user });
  });
}

// API Routes
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/admin', adminRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/user', userRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'CineBook API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Cannot ${req.method} ${req.url}` 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});