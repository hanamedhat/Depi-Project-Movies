
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePage = ({ user, setUser }) => {
    const [watchLaterMovies, setWatchLaterMovies] = useState([]);
    const [historyMovies, setHistoryMovies] = useState([]);

    useEffect(() => {
      const token = localStorage.getItem('token');
      
      // Check if token exists in localStorage
      if (token && !user) {
          // If there's a token but no user in state, fetch user details
          axios.post('http://localhost:4000/api/getUser', {
              headers: {
                  Authorization: `Bearer ${token}`,
              },
          })
          .then(response => {
              setUser(response.data.user);  // Set user in state
          })
          .catch(error => {
              console.error('Error fetching user details:', error);
              localStorage.removeItem('token');  // If token is invalid, remove it
          });
      }
  }, [user, setUser]);

    useEffect(() => {
        const fetchWatchLaterMovies = async () => {
            try {
                // Send POST request to fetch watch later movies
                const response = await axios.post('http://localhost:4000/api/getwatchlater', { user_id: user._id });
                setWatchLaterMovies(response.data.watchLaterList);
            } catch (error) {
                console.error('Error fetching watch later movies:', error);
            }
        };

        const fetchHistoryMovies = async () => {
          console.log("User ID:", user._id);
      
          if (!user || !user._id) {
              console.error("User ID is not available");
              return;
          }
      
          try {
              // Retrieve the token from local storage
              const token = localStorage.getItem('token');
      
              // Make the API call with Authorization header
              const response = await axios.post(
                'http://localhost:4000/api/gethistory',
                { user_id: user._id }, // Send user_id in the body
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    }
                }
            );
      
              console.log("API Response:", response.data); // Log the response
              setHistoryMovies(response.data.historyList);
          } catch (error) {
              console.error('Error fetching history:', error.response ? error.response.data : error.message);
          }
      };
      
  
  if (user) {
      fetchWatchLaterMovies();
      fetchHistoryMovies(); // Fetch watched movies
  }
}, [user]);

     // Create a Set to keep track of unique movies
  const uniqueMovies = Array.from(
    new Set(watchLaterMovies.map(movie => movie.movie_api_id))
  ).map(id => {
    return watchLaterMovies.find(movie => movie.movie_api_id === id);
  });
  const uniqueHistoryMovies = Array.from(
    new Set(historyMovies.map(movie => movie.movie_api_id))
).map(id => {
    return historyMovies.find(movie => movie.movie_api_id === id);
});

    return (
      <div className="profile">
      {user ? (
          <>
              <h1>{user.username}'s Profile</h1>
              <h1>Your Watch Later Movies</h1>
              <div className="movie-container">
                  {uniqueMovies.length > 0 ? (
                      uniqueMovies.map(movie => (
                          <div key={movie._id} className="movie-card">
                              <h3>{movie.movieDetails.Title}</h3>
                              <p>{movie.movieDetails.Overview}</p>
                              <img src={movie.movieDetails.Poster_Url} alt={movie.movieDetails.Title} />
                          </div>
                      ))
                  ) : (
                      <p>You have no movies in your watch later list.</p>
                  )}
              </div>
              {/* Watched Movies */}
              <h1>Your Watched Movies</h1>
              <div className="movie-container">
                  {uniqueHistoryMovies.length > 0 ? (
                      uniqueHistoryMovies.map(movie => (
                          <div key={movie.movie_api_id} className="movie-card">
                              <h3>{movie.movieDetails.Title}</h3>
                              <p>{movie.movieDetails.Overview}</p>
                              <img src={movie.movieDetails.Poster_Url} alt={movie.movieDetails.Title} />
                          </div>
                      ))
                  ) : (
                      <p>You have no watched movies in your history.</p>
                  )}
              </div>
          </>
      ) : (
          <p>Please log in to see your profile.</p>
      )}
  </div>
    );
};

export default ProfilePage;

