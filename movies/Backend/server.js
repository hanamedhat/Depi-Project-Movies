const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 4000;
const routes = require('./routes/routes');
const History = require('./models/historyModel');
const movieCache = [];
const movieCachee = new Map();
let isCacheLoaded = false; // Flag to track cache status
// Use CORS middleware to allow requests from the React frontend
app.use(cors());
app.use(express.json()); // Add this to parse incoming JSON data

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/moviesdb').then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



// Function to fetch movie data with retries
const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url);
        } catch (error) {
            console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
            if (i === retries - 1) {
                throw error; // Throw the error if the last attempt fails
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

// Function to fetch data from the API
const fetchData = async (offset, length) => {
    const url = `https://datasets-server.huggingface.co/rows?dataset=Pablinho%2Fmovies-dataset&config=default&split=train&offset=${offset}&length=${length}`;
    return fetchWithRetry(url);
};



const prefetchDataset = async () => {
    let offset = 0;
    const length = 100;

    try {
        const totalRowsResponse = await axios.get('https://datasets-server.huggingface.co/info?dataset=Pablinho%2Fmovies-dataset&config=default');
        const totalRows = totalRowsResponse.data.dataset_info.splits.train.num_examples;

        while (offset < totalRows) {
            const rowsResponse = await fetchData(offset, length);
            movieCache.push(...rowsResponse.data.rows);
            offset += length;
        }
        isCacheLoaded = true;  // Set flag once caching is done
        console.log(isCacheLoaded)
        console.log('All movies cached successfully:', movieCache.length);
    } catch (error) {
        console.error('Error prefetching dataset:', error.message);
    }
};

// Call the prefetchDataset function during server startup
prefetchDataset();

app.get('/movies/:title', (req, res) => {
    const { title } = req.params; // Get title from URL parameters
    const decodedTitle = decodeURIComponent(title).trim().toLowerCase();

    console.log("Requested movie title:", decodedTitle); // Log the decoded title for debugging
    
    try {
        const movie = movieCache.find(m => {
            const cachedTitle = m.row.Title.trim().toLowerCase();
            console.log("Comparing with cached title:", cachedTitle); // Log each title from cache
            return cachedTitle === decodedTitle;
        });
        
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }

        console.log("Movie found:", movie.row.Title);
        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ error: 'Failed to fetch movie details.' });
    }
});

// Route to search the cached movies
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q.toLowerCase();
    const matchedMovies = movieCache.filter(movie => 
        movie.row.Title && movie.row.Title.toLowerCase().includes(searchTerm)
    );
    res.json({ totalMatches: matchedMovies.length, movies: matchedMovies });
});


// Function to fetch a specific movie by ID
const fetchMovieById = async (movie_api_id) => {
    // Check if the movie is already in the cache
    if (movieCachee.has(movie_api_id)) {
        return movieCachee.get(movie_api_id);
    }

    // Otherwise, fetch from the API (with retries if necessary)
    const length = 1; // Fetch just one movie
    const url = `https://datasets-server.huggingface.co/rows?dataset=Pablinho%2Fmovies-dataset&config=default&split=train&offset=${movie_api_id}&length=${length}`;
    
    try {
        const movieResponse = await fetchWithRetry(url);
        const movie = movieResponse.data.rows[0];
        
        // Store in cache and return
        movieCachee.set(movie_api_id, movie);
        return movie;
    } catch (error) {
        console.error(`Error fetching movie with ID ${movie_api_id}:`, error.message);
        return null;
    }
};

app.get('/api/history/recommendations', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        // Step 1: Fetch user's watch history
        const historyList = await History.find({ user_id });

        if (!historyList.length) {
            return res.status(404).json({ message: 'No movies found in history.' });
        }

        // Step 2: Fetch the movies related to the user's history dynamically
        const watchedGenres = [];

        for (const historyEntry of historyList) {
            const movie = await fetchMovieById(historyEntry.movie_api_id);
            if (movie && movie.row.Genre) {
                watchedGenres.push(...movie.row.Genre.split(',').map(genre => genre.trim())); // Split genres and clean up spaces
            }
        }

        // Step 3: Recommend movies based on genres and cache them as needed
        const uniqueGenres = [...new Set(watchedGenres)];
        const recommendedMovies = [];

        for (let i = 0; i < 100; i++) { // Instead of fetching all, fetch dynamically
            const movie = await fetchMovieById(i); // You can adjust this based on available data
            if (movie && movie.row.Genre) {
                const movieGenres = movie.row.Genre.split(',').map(genre => genre.trim());
                if (movieGenres.some(genre => uniqueGenres.includes(genre))) {
                    recommendedMovies.push(movie);
                }
            }
            if (recommendedMovies.length >= 10) break;
        }

        return res.json({ recommendedMovies });
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

  
app.use('/api', routes);
module.exports = { app, movieCache };

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
