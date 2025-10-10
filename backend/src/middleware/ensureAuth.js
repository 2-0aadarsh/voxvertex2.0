export const ensureAuthenticated = (req, res, next) => {
  console.log('Auth Check - Session:', req.session); // Debug session
  console.log('Auth Check - User:', req.user); // Debug user
  console.log('Auth Check - isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : false); // Debug auth status

  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('User authenticated successfully');
    return next();
  }
  
  console.log('Authentication failed');
  res.status(401).json({ 
    success: false,
    message: "Authentication required. Please log in to access this resource."
  });
};
