const express = require('express');
const router = express.Router();
const { registerUser } = require('./controllers/register');
const csrfProtection = require('./path/to/your/csrfMiddleware'); // Adjust the path as necessary

// Route for CSRF token retrieval
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Registration route
router.post('/register', csrfProtection, registerUser);

module.exports = router;
