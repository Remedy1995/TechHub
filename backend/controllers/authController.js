const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).send({ error: 'User already exists with that email or username' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };

        res.status(201).send({ user: userResponse, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };

        res.send({ user: userResponse, token });
    } catch (error) {
        res.status(400).send({ error: 'Invalid login credentials' });
    }
};

const logout = async (req, res) => {
    try {
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
