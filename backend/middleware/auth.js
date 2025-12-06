const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, is_admin')
            .eq('id', decoded.id)
            .maybeSingle();

        if (error || !user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        res.status(401).json({ message: 'Not authorized to access this route' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.is_admin) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { auth, admin };
