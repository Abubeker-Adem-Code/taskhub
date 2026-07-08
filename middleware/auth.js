require('dotenv').config();
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.user) {
            req.user = decoded.user;
        } else {
            req.user = decoded;
        }
        
        next();
    } catch (error) {
        console.error("MIDDLEWARE ERROR DETECTED:", error.message);
        return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `Only ${role}s can perform this action.` });
        }
        next();
    };
};

module.exports = { verifyToken, requireRole };
