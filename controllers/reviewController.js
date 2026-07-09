const db = require('../config/database');

const getAllReviews = (req, res) => {
    try {
        const reviews = db.prepare(`
            SELECT 
                reviews.id,
                reviews.rating,
                reviews.comment,
                reviews.created_at AS createdAt,
                users.name AS authorName,
                users.role AS role
            FROM reviews
            JOIN users ON reviews.reviewer_id = users.id
            ORDER BY reviews.created_at DESC
        `).all();

        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching reviews' });
    }
};

module.exports = { getAllReviews };
