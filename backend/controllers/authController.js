const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists with that email or username' });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ error: 'Please provide both email and password' });
        }
        
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }, 
            token 
        });
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('No user found')) {
            return res.status(400).send({ error: 'No account found with this email' });
        }
        if (error.message.includes('Incorrect password')) {
            return res.status(400).send({ error: 'Incorrect password' });
        }
        
        // For any other error, log it and return a generic message
        console.error('Unexpected login error:', error);
        res.status(400).send({ 
            error: 'Login failed. Please check your credentials and try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// In authController.js - Update the logout function
const logout = async (req, res) => {
    try {
        // Remove all tokens (since we're only keeping one now)
        req.user.tokens = [];
        await req.user.save();
        res.send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Error logging out' });
    }
};
module.exports = {
    register,
    login,
    logout
};
