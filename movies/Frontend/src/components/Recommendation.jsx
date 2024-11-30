import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Recommendations = ({ user }) => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  // Fetch recommended movies from the backend
  const fetchRecommendations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to see recommendations.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/history/recommendations",
        { user_id: user._id }, // Ensure you're passing the correct user_id
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRecommendedMovies(response.data.recommendedMovies);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to load recommendations.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations(); // Fetch recommendations when the component mounts
    }
  }, [user]);

  return (
    <div style={{ backgroundColor: "#141414", color: "#fff", padding: "20px" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Recommended Movies</h1>
      <div id="recommendationContainer">
        {recommendedMovies.map((movie, index) => (
          <div key={index} style={{ margin: "10px" }}>
            <img src={movie.row.Poster_Url} alt={movie.row.Title} />
            <h3>{movie.row.Title}</h3>
            <p>{movie.row.Overview}</p>
            <Link to={`/movies/${encodeURIComponent(movie.row.Title)}`}>
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
