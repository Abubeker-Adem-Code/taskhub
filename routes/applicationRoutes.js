const express = require('express');
const router = express.Router();
const { applyForTask, acceptApplication, getMyApplications, getApplicationsForMyTasks } = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/auth');
router.post('/tasks/:id/apply', verifyToken, applyForTask);
router.patch('/applications/:id/accept', verifyToken, acceptApplication);
router.get('/applications/mine', verifyToken, getMyApplications);
router.get('/applications/for-my-tasks', verifyToken, getApplicationsForMyTasks);

module.exports = router;

