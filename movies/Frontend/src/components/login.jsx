// src/components/LoginPage.js
import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });
      const { token, user } = response.data;

      // Store the token in localStorage
      localStorage.setItem("token", token);
      setUser(user); // Set the user in the App state
      navigate("/profile"); // Redirect to the profile page
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="bodyForm">
      <form className="forms" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
