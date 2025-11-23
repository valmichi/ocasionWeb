const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define la ruta POST para el login de Google
// Endpoint: POST http://10.55.87.127:3000/api/auth/google
router.post('/google', authController.googleLogin);

module.exports = router;