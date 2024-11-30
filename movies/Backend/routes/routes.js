const express = require('express');
const router = express.Router();
const authController = require('../controllers/UserController');
const watchLaterController = require('../controllers/watchLaterController');
const historyController = require('../controllers/historyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const moviesController = require('../controllers/movieController')

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/movies', moviesController.getMovies)

// Logout user (no auth required since it's a client-side operation)
router.post('/logout', authController.logout);

router.post('/watchlater', authMiddleware, watchLaterController.addToWatchLater);

// Route to get the Watch Later list (with cache check middleware)
router.post('/getwatchlater', watchLaterController.getWatchLater);

router.post('/history', authMiddleware, historyController.addToHistory);
router.post('/gethistory', authMiddleware, historyController.getHistory);
router.post('/getUser', authMiddleware, authController.getUser);

// router.get('/history/recommendations', historyController.getRecommendations);

module.exports = router;