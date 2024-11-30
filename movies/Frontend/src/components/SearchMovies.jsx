import React, { useState } from 'react';
import axios from 'axios';

const MovieSearch = ({ onSearchResults, onSearchTermChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to handle the search
    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/api/search', {
                params: { q: searchTerm },
            });

            // Log the response to see if data is returned correctly
            console.log('Search Response:', response.data.movies);

            // Pass the matched movies to the parent
            onSearchResults(response.data.movies);

        } catch (error) {
            console.error('Error searching movies:', error);
        }
        setLoading(false);
    };

    // Trigger the search term change handler
    const handleTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearchTermChange(value); // Pass the term to the parent component
    };

    return (
        <div style={{ textAlign: 'center'}}>
            {/* Search bar */}
            <input
                type="text"
                value={searchTerm}
                onChange={handleTermChange}
                placeholder="Search for a movie..."
                style={{ padding: '10px', width: '300px', marginRight: '10px',textAlign:'center' }}
            />
            <button onClick={handleSearch} style={{ padding: '10px' }}>
                Search
            </button>

            {/* Show loading message while searching */}
            {loading && <p>Loading...</p>}
        </div>
    );
};

export default MovieSearch;
