// Middleware to check if the movie cache is ready
module.exports = (req, res, next) => {
    const { isCacheLoaded } = require('../server');
    
    if (!isCacheLoaded) {
        return res.status(503).json({ error: 'Movie cache is still loading. Please try again later.' });
    }

    // If the cache is loaded, proceed to the next middleware or route handler
    next();
};