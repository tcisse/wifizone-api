const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WiFi Zone API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
