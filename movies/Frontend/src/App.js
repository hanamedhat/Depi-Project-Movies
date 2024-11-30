// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MoviePosters from './components/MoviePoster';
import ProfilePage from './components/profiel';
import LoginPage from './components/login';
import RegisterPage from './components/RegisterPage';
import Navbar from './components/navBar';
import axios from 'axios';
import MovieDetails from './components/MovieDetails';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Optionally verify the token with the backend to fetch user details
            axios.get('http://localhost:4000/api/user', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(response => {
                setUser(response.data); // Set user data from the backend
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    }, []);
    return (
        <Router>
            <Navbar />
            <div className="App">
            <Routes>
                <Route path="/" element={<MoviePosters  user={user} />} />
                <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />
                <Route path="/login" element={<LoginPage setUser={setUser} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/movies/:title" element={<MovieDetails user={user}/>} />
            </Routes>
            </div>
        </Router>
    );
};

export default App;