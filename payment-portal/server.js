require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const csurf = require('csurf'); // Import csurf
const cookieParser = require('cookie-parser'); // Import cookie-parser
const app = express();

// Middleware
app.use(cookieParser()); // Add this line to parse cookies
app.use(helmet());
app.use(cors());
app.use(express.json());

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Session management
app.use(session({
    secret: process.env.SECRET_KEY, // Use your secret key here
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// CSRF protection middleware
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use true in production
        sameSite: 'Strict' 
    }
});
app.use(csrfProtection); // Apply the CSRF protection middleware

// Route to get CSRF token
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Route protection for login with Express Brute
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// SSL Certificates
const sslKey = fs.readFileSync('server.key');
const sslCert = fs.readFileSync('server.cert');

// Create HTTPS server
const httpsServer = https.createServer({ key: sslKey, cert: sslCert }, app);

// Also run HTTP server for non-SSL connections
const httpServer = http.createServer(app);

// Ports
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

// Start HTTP server
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server running on port ${HTTP_PORT}`);
});
