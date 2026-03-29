import express from 'express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from "@clerk/express";

import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = 3000;

// DB connect
await connectDB();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Clerk middleware (IMPORTANT)
app.use(clerkMiddleware());

// Test route
app.get('/', (req, res) => res.send('Server is Live'));

// Debug route (VERY USEFUL 🔥)
app.get('/debug-auth', (req, res) => {
  res.json({
    auth: req.auth,
    headers: req.headers.authorization
  });
});

// Routes
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});