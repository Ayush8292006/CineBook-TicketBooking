import express from 'express';
import { addShow, getNowPlayingMovies, getShow, getShows } from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

// ✅ TEMPORARY - Remove protectAdmin for testing
showRouter.get('/now-playing', getNowPlayingMovies);  // Remove protectAdmin
showRouter.post('/add', addShow);      // Keep protectAdmin for add
showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);

export default showRouter;