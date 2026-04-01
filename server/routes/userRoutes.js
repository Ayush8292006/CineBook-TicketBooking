import express from 'express';
import { getFavorites, getUserBookings, updateFavorite } from '../controllers/userController.js';
import { requireAuth } from '@clerk/express';

const userRouter = express.Router();

//  PING TEST ROUTE (no auth)
userRouter.get('/ping', (req, res) => {
  console.log(" PING route hit!");
  res.json({ success: true, message: "pong", time: new Date().toISOString() });
});

//  Protected routes with debug logs
userRouter.get('/bookings', requireAuth(), (req, res, next) => {
  console.log(" BOOKINGS route hit!");
  next();
}, getUserBookings);

userRouter.post('/update-favorite', requireAuth(), (req, res, next) => {
  console.log(" UPDATE-FAVORITE route hit!");
  next();
}, updateFavorite);

userRouter.get('/favorites', requireAuth(), (req, res, next) => {
  console.log(" FAVORITES route hit!");
  next();
}, getFavorites);

console.log(" userRoutes loaded - /ping, /update-favorite, /favorites");

export default userRouter;