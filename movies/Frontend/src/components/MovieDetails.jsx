import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MovieDetails = () => {
    const { title } = useParams(); // Get title from the URL parameters
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                // Encode the title to handle special characters and spaces
                const response = await axios.get(`http://localhost:4000/movies/${encodeURIComponent(title)}`);
                setMovie(response.data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [title]);

    
    const handleWatch = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/history', {
                movie_api_id: movie.row_idx
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is correctly stored
                }
            });
            setMessage(response.data.message);
        } catch (error) {
            console.error('Error adding movie to history:', error);
            setMessage('Error adding movie to watch history.');
        }
    };
    
    if (loading) return <p>Loading movie details...</p>;
    if (!movie) return <p>Movie not found.</p>;

    return (
        <div className='detalis'>
            <h1>{movie.row.Title}</h1>
            <h2>{movie.row_idx}</h2>
            <img src={movie.row.Poster_Url} alt={movie.row.Title} />
            <p>{movie.row.Overview}</p>
            <p>Release Date: {movie.row.Release_Date}</p>
            <p>Genre: {movie.row.Genre}</p>
            <p>Rating: {movie.row.Vote_Average}</p>
            <button onClick={handleWatch}>Watch</button>
            {message && <p>{message}</p>}
            {/* Add other movie details here */}
        </div>
    );
};

export default MovieDetails;
