// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    // Function to handle logout
    const handleLogout = () => {
        // Remove the token from localStorage
        localStorage.removeItem('token');
        
        // Redirect the user to the login page
        navigate('/login');
    };

    // Check if the user is logged in by checking if a token is in localStorage
    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <nav className="nav">
        <ul>
            <li>
                <Link to="/" className="link">Movies</Link>
            </li>

            {!isLoggedIn ? (
                <>
                    <li>
                        <Link to="/login" className="link">Login</Link>
                    </li>
                    <li>
                        <Link to="/register" className="link">Register</Link>
                    </li>
                </>
            ) : (
                <>
                    <li>
                        <Link to="/profile" className="link">Profile</Link>
                    </li>
                    <li>
                        {/* Logout button */}
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                </>
            )}
        </ul>
    </nav>
    );
};




export default Navbar;