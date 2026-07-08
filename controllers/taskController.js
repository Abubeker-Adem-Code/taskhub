const db = require('../config/database');

const createTask = (req, res) => {
    try{
        const {title, description, budget, deadline } = req.body;
        if (!title || !description || !budget) {
            return res.status(400).json({ error: 'Title, description, and budget are required' });
        }
    const insert = db.prepare(
        'INSERT INTO tasks (client_id, title, description, budget, deadline) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insert.run(req.user.id, title, description, budget, deadline || null);

    res.status(201).json({message: 'Task created', taskId: result.lastInsertRowid });
} catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating task' });
}
};
const getAllTasks = (req, res) => {
    try {
        const tasks = db.prepare("SELECT * FROM tasks WHERE status = 'open'").all();
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching tasks' });
    }
};

const getTaskById = (req, res) => {
    try{
        const task = db.prepare('SELECT * FROM tasks  WHERE id = ?').get(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching task' });
    }
};

const updateTaskStatus = (req, res) => {
    try {
        const { status } = req.body;
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
         if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.client_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the task owner can update status' });
        }
        db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, req.params.id);
         res.status(200).json({ message: 'Task status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating task' });
    }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTaskStatus };

