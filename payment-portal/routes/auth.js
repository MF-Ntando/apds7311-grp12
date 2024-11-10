const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const ExpressBrute = require('express-brute');
const csrf = require('csurf');

// Setup Express Brute
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 5000,
    maxWait: 60000,
    lifetime: 3600
});

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });

// Register Route with rate limiting and CSRF protection
router.post('/register', bruteforce.prevent, csrfProtection, registerUser);

// Login Route with rate limiting and CSRF protection
router.post('/login', bruteforce.prevent, csrfProtection, loginUser);

// Route to get CSRF token
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

module.exports = router; // Ensure the router is exported correctly
