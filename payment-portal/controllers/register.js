const User = require('../models/User');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    // Validate email input
    if (!validator.isEmail(username)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const newUser = await User.create({
            username,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'User registration failed', details: error });
    }
};
