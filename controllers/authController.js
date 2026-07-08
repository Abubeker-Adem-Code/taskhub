const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = requiree('../config/database');

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
            'INSERT INTO users ( (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
        );
        const result = insert.run(name, email, passwordHash, role);
        res.status(201).json({message: 'User registered successfully', userId: result.lastInsertRowid });
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};
module.exports = { register };
