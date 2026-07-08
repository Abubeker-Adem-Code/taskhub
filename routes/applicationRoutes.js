const express = require('express');
const router = express.Router();
const { applyForTask, acceptApplication } = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/auth');

router.post('/tasks/:id/apply', verifyToken, applyForTask);
router.patch('/applications/:id/accept', verifyToken, acceptApplication);

module.exports = router;

