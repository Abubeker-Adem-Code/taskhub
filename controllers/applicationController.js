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

module.exports = { applyForTask, acceptApplication };
