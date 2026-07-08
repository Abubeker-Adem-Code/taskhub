const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, requireRole } = require('../middleware/auth');
router.post('/', verifyToken, requireRole('client'), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id/status', verifyToken, taskController.updateTaskStatus);
router.patch('/:id/complete', verifyToken, taskController.completeTask);
router.post('/:id/review', verifyToken, taskController.createReview);

module.exports = router;
