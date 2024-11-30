import React, { useState, useEffect } from "react";
import axios from "axios";
import MovieSearch from "./SearchMovies";
import { Link } from "react-router-dom";
import Recommendations from "./Recommendation";

const MoviePosters = ({ user }) => {
  const [movies, setMovies] = useState([]); // State for all movies
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [offset, setOffset] = useState(0);
  const [totalRows, setTotalRows] = useState(null);
  const length = 100; // Number of movies to fetch at a time

  // Function to fetch movie data from the backend
  const fetchMovies = async (newOffset) => {
    try {
      const response = await axios.get("http://localhost:4000/api/movies", {
        params: { offset: newOffset, length },
      });
      const { totalRows, rows } = response.data;

      // Append fetched movies to the existing list
      setMovies((prevMovies) => [...prevMovies, ...rows.map((row) => row.row)]);
      setTotalRows(totalRows);
      setOffset(newOffset + length);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  // Fetch the first batch of movies when the component mounts
  useEffect(() => {
    fetchMovies(0);
  }, []);

  // Handle search results from the MovieSearch component
  const handleSearchResults = (results) => {
    console.log("Received Search Results:", results); // Log the results to ensure data is correct
    setSearchResults(results); // Set search results based on user input
  };

  // Handle changes in the search term to clear results if the input is empty
  const handleSearchTermChange = (term) => {
    if (!term) {
      setSearchResults([]); // Clear search results when the input is empty
    }
  };

  const addToWatchLater = async (user_id, movie_api_id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add movies to your watch later list.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/watchlater",
        { user_id, movie_api_id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the correct token
          },
        }
      );
      alert("Movie added to watch later!");//toster
    } catch (error) {
      console.error("Error adding movie to watch later:", error);
      alert("Failed to add movie to watch later.");
    }
  };

  // Determine which movies to display based on the search results
  const moviesToDisplay =
    searchResults.length > 0 ? searchResults.map((movie) => movie.row) : movies;

  return (
    <div style={{ backgroundColor: "#141414", color: "#fff", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Movie Posters</h1>
      <MovieSearch
        onSearchResults={handleSearchResults}
        onSearchTermChange={handleSearchTermChange}
      />

      <div id="posterContainer">
        {moviesToDisplay.map(
          (movie, index) =>
            movie.Poster_Url && (
              <div key={index}>
                <img src={movie.Poster_Url} alt={movie.Title} />
                <h3>{movie.Title}</h3>
                <button
                  onClick={() => addToWatchLater(movie.row_idx, movie.Title)}
                >
                  Add to Watch Later
                </button>
                <Link to={`/movies/${encodeURIComponent(movie.Title)}`}>
                  View Details
                </Link>
              </div>
            )
        )}
      </div>

      {offset < totalRows && searchResults.length === 0 && (
        <button
          onClick={() => fetchMovies(offset)}
          style={{ display: "block", margin: "20px auto" }}
        >
          Load More
        </button>
      )}
      {/* Add the Recommendations component here */}
      <Recommendations user={user} />
    </div>
  );
};

export default MoviePosters;
