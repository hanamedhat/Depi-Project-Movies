const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.header('Authorization');
  
  // Check if the Authorization header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided or incorrect format' });
  }

  // Extract the token by replacing "Bearer " with an empty string
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded; // Attach the decoded token (user info) to the request object
    next(); // Continue to the next middleware
  } catch (err) {
    // If token verification fails, send an unauthorized response
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
