const WatchLater = require('../models/watchLaterModel');
const axios = require('axios');

// Add a movie to Watch Later
exports.addToWatchLater = async (req, res) => {
  const { movie_api_id } = req.body;
  const userId = req.user.userId; // Assume JWT authentication middleware

  try {
    const watchLater = new WatchLater({ user_id: userId, movie_api_id });
    await watchLater.save();
    res.status(201).json({ message: 'Movie added to Watch Later' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWatchLater = async (req, res) => {
  const { user_id } = req.body; // Get user ID from the request body
console.log("getinnnnn")
  console.log("Fetching watch later movies for user ID:", user_id);
  
  if (!user_id) {
      return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
      const watchLaterList = await WatchLater.find({ user_id }); // Fetch watch later movies for the user

      if (!watchLaterList.length) {
          return res.status(404).json({ message: 'No movies found in watch later list.' });
      }

      // Fetch movie details for each entry in the watch later list
      const moviesWithDetails = await Promise.all(
          watchLaterList.map(async (entry) => {
              // Construct the API URL to get all movies
              const movieApiUrl = `http://localhost:4000/api/movies`; // Fetch all movies data
              
              try {
                  const movieResponse = await axios.get(movieApiUrl);
                  
                  // Search for the movie with the matching movie_api_id in the response
                  const movieDetails = movieResponse.data.rows.find(movie => movie.row.Title === entry.movie_api_id); // Adjust this condition to match your filtering logic

                  // If no movie found, handle gracefully
                  if (!movieDetails) {
                      console.error(`No movie details found for movie API ID: ${entry.movie_api_id}`);
                      return { ...entry._doc, movieDetails: null };
                  }

                  return {
                      ...entry._doc,
                      movieDetails: movieDetails.row, // Attach the found movie details
                  };
              } catch (error) {
                  console.error(`Error fetching movie details for movie API ID ${entry.movie_api_id}:`, error.message);
                  return { ...entry._doc, movieDetails: null }; // Return entry with null details on error
              }
          })
      );

      // Respond with the watch later list including movie details
      return res.json({ watchLaterList: moviesWithDetails });
  } catch (error) {
      console.error('Error fetching watch later list:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};