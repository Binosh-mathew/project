const express = require('express');
const { check } = require('express-validator');
const {
  register,
  login,
  adminLogin,
  developerLogin
} = require('../controllers/auth.controller');

const router = express.Router();

// Validation middleware
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);
router.post('/developer/login', loginValidation, developerLogin);

module.exports = router; 