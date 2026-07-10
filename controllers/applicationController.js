const db = require('../config/database');
const applyForTask = async (req, res) => {
    const task_id = req.params.id;  
    const { proposal, bid_amount } = req.body;
    const worker_id = req.user.id;  

    if (!proposal || !bid_amount) {
        return res.status(400).json({ error: 'Proposal and bid amount are required.' });
    }

    try {
         
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task_id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }
        if (task.status !== 'open') {
            return res.status(400).json({ error: 'Task is no longer open for applications.' });
        }
 
        const insert = db.prepare(`
            INSERT INTO applications (task_id, worker_id, proposal, bid_amount, status)
            VALUES (?, ?, ?, ?, 'pending')
        `);
        const result = insert.run(task_id, worker_id, proposal, bid_amount);

        res.status(201).json({ message: 'Application submitted successfully', applicationId: result.lastInsertRowId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const acceptApplication = async (req, res) => {
    const application_id = req.params.id;  

    try {
         
        const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(application_id);
        if (!app) {
            return res.status(404).json({ error: 'Application not found.' });
        }

        
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(app.task_id);
        if (!task || task.status !== 'open') {
            return res.status(400).json({ error: 'Task is not open or already assigned.' });
        }

        const runTransaction = db.transaction(() => {
    
            db.prepare("UPDATE applications SET status = 'accepted' WHERE id = ?").run(application_id);

            db.prepare("UPDATE tasks SET status = 'assigned' WHERE id = ?").run(app.task_id);

            db.prepare(`
                UPDATE applications 
                SET status = 'rejected' 
                WHERE task_id = ? AND id != ? AND status = 'pending'
            `).run(app.task_id, application_id);
        });

        runTransaction();  

        res.status(200).json({ message: 'Application accepted. Task assigned and other offers rejected.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getMyApplications = async (req, res) => {
    const worker_id = req.user.id;

    try {
        const applications = db.prepare(`
            SELECT 
                applications.id,
                applications.proposal,
                applications.bid_amount,
                applications.status,
                applications.created_at,
                tasks.title AS taskTitle,
                tasks.budget AS taskBudget
            FROM applications
            JOIN tasks ON applications.task_id = tasks.id
            WHERE applications.worker_id = ?
            ORDER BY applications.created_at DESC
        `).all(worker_id);

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getApplicationsForMyTasks = async (req, res) => {
    const client_id = req.user.id;

    try {
        const applications = db.prepare(`
            SELECT 
                applications.id,
                applications.proposal,
                applications.bid_amount,
                applications.status,
                applications.created_at,
                tasks.id AS taskId,
                tasks.title AS taskTitle,
                tasks.status AS taskStatus,
                users.name AS workerName
            FROM applications
            JOIN tasks ON applications.task_id = tasks.id
            JOIN users ON applications.worker_id = users.id
            WHERE tasks.client_id = ?
            ORDER BY applications.created_at DESC
        `).all(client_id);

        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { applyForTask, acceptApplication, getMyApplications, getApplicationsForMyTasks };
