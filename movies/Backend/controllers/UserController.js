const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration
exports.register = async (req, res) => {
    try {
    const { username, email, password } = req.body;
      console.log(req.body); // Debug: Check the received data
    
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10); // Make sure `password` is not undefined
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err); // Debug the error
      res.status(500).json({ error: err.message });
    }
  };
// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    // Generate JWT token with user ID
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Return the token and user data including _id, username, and email
    return res.json({
      token, 
      user: {
        _id: user._id,     // Include user ID
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ error: err.message });
  }
};


// User logout
exports.logout = (req, res) => {
  // The client is responsible for removing the token (JWT) from its storage (e.g., localStorage, cookies)
  res.status(200).json({ message: 'User logged out successfully' });
};


exports.getUser = async (req, res) => {
  try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, 'your_jwt_secret');
      const user = await User.findById(decoded._id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
  } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
  }
};