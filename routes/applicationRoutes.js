const express = require('express');
const router = express.Router();
const { applyForTask, acceptApplication, getMyApplications } = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/auth');

router.post('/tasks/:id/apply', verifyToken, applyForTask);
router.patch('/applications/:id/accept', verifyToken, acceptApplication);
router.get('/applications/mine', verifyToken, getMyApplications);

module.exports = router;

