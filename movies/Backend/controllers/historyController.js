const History = require('../models/historyModel');
const axios = require('axios');

exports.addToHistory = async (req, res) => {
  const { movie_api_id } = req.body;
  const user_id = req.user.userId; // Use userId instead of _id

  if (!user_id) {
      return res.status(400).json({ message: 'User not authenticated' });
  }

  try {
      const existingEntry = await History.findOne({ user_id, movie_api_id });
      if (existingEntry) {
          return res.status(400).json({ message: 'Movie is already in your watch history.' });
      }

      const newHistory = new History({ user_id, movie_api_id });
      await newHistory.save();
      res.status(201).json({ message: 'Movie added to history', history: newHistory });
  } catch (error) {
      console.error('Error adding movie to history:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

exports.getHistory = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const historyList = await History.find({ user_id });

    if (!historyList.length) {
      return res.status(404).json({ message: 'No movies found in history.' });
    }

    // Fetch all movies from the API
    const movieApiUrl = `http://localhost:4000/api/movies`; 
    const movieResponse = await axios.get(movieApiUrl);
    const moviesData = movieResponse.data.rows; // All movies data

    // Match history movie_api_id with movie row_idx
    const moviesWithDetails = historyList.map(historyEntry => {
      const matchingMovie = moviesData.find(movie => movie.row_idx == historyEntry.movie_api_id);

      if (matchingMovie) {
        // Attach movie details if match found
        return {
          ...historyEntry._doc, 
          movieDetails: matchingMovie.row // Attach the movie details from API
        };
      } else {
        console.error(`No movie details found for movie API ID: ${historyEntry.movie_api_id}`);
        return {
          ...historyEntry._doc,
          movieDetails: null
        };
      }
    });

    return res.json({ historyList: moviesWithDetails });
  } catch (error) {
    console.error('Error fetching history:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};





// exports.getRecommendations = async (req, res) => {
//   const { user_id } = req.body;

//   if (!user_id) {
//     return res.status(400).json({ message: 'User ID is required.' });
//   }

//   try {
//     // Fetch the user's watch history
//     const historyList = await History.find({ user_id });

//     if (!historyList.length) {
//       return res.status(404).json({ message: 'No movies found in history.' });
//     }

//     // Fetch all movies from the API
//     const movieApiUrl = `http://localhost:4000/api/movies`;
//     const movieResponse = await axios.get(movieApiUrl);
//     const moviesData = movieResponse.data.rows; // All movies data

//     // Match history movie_api_id with movie row_idx and extract genres
//     let watchedGenres = new Set();
//     historyList.forEach(historyEntry => {
//       const matchingMovie = moviesData.find(movie => movie.row_idx == historyEntry.movie_api_id);
//       if (matchingMovie) {
//         // Split genres and add them to the Set (to avoid duplicates)
//         const movieGenres = matchingMovie.row.Genre.split(',').map(genre => genre.trim());
//         movieGenres.forEach(genre => watchedGenres.add(genre));
//       }
//     });

//     // Convert Set to Array
//     const genreList = Array.from(watchedGenres);

//     if (genreList.length === 0) {
//       return res.status(404).json({ message: 'No genres found in watched movies.' });
//     }

//     // Fetch movies from the API that match any of the genres
//     const recommendedMovies = movieCache.filter(movie => {
//       const movieGenres = movie.row.Genre.split(',').map(genre => genre.trim());
//       return movieGenres.some(genre => genreList.includes(genre));
//     });

//     // Limit the recommended movies to 10
//     const limitedRecommendations = recommendedMovies.slice(0, 10);

//     if (!limitedRecommendations.length) {
//       return res.status(404).json({ message: 'No recommendations found.' });
//     }

//     // Return the recommended movies
//     return res.json({ recommendedMovies: limitedRecommendations });

//   } catch (error) {
//     console.error('Error fetching recommendations:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };
