require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = async (req, res) => {
    try {
        const {name, email, password, role } = req.body;

        if(!name || !email || !password || !role) {
            return res.status(400).json({error: 'All fields are required' });
        }
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
         if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const insert = db.prepare(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
        );
        const result = insert.run(name, email, passwordHash, role);
        res.status(201).json({message: 'User registered successfully', userId: result.lastInsertRowid });
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        if (global.logAction) global.logAction('LOGIN_ATTEMPT', { email: req.body.email, status: 'SUCCESS' });
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = { register, login };
