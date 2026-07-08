const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, getTaskById, updateTaskStatus } = require('../controllers/taskController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('client'), createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.patch('/:id/status', verifyToken, updateTaskStatus);

module.exports = router;
