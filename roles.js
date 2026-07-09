const db = require('./config/database');
const client = db.prepare("SELECT id FROM users WHERE role = 'client' LIMIT 1").get();
const worker = db.prepare("SELECT id FROM users WHERE role = 'worker' LIMIT 1").get();

if (!client) {
    console.log('No client user found. Register a client account first, then run this again.');
    process.exit();
}

const fenceTask = db.prepare("SELECT id FROM tasks WHERE title LIKE '%fence%'").get();

if (fenceTask) {
    db.prepare("DELETE FROM reviews WHERE task_id = ?").run(fenceTask.id);
    db.prepare("DELETE FROM applications WHERE task_id = ?").run(fenceTask.id);
    db.prepare("DELETE FROM tasks WHERE id = ?").run(fenceTask.id);
    console.log('Fence task and its related reviews/applications removed.');
} else {
    console.log('No fence task found — may already be removed.');
}

const insertTask = db.prepare(
    'INSERT INTO tasks (client_id, title, description, budget, status) VALUES (?, ?, ?, ?, ?)'
);
insertTask.run(client.id, 'Entry-Level Frontend Developer', 'Build and maintain responsive UI components using modern JavaScript frameworks.', 25, 'open');
insertTask.run(client.id, 'Senior Backend Developer', 'Design and scale REST APIs, own database architecture and deployment pipeline.', 95, 'open');
insertTask.run(client.id, 'A Full Stack Developer', 'Manage production databases, optimize queries, and ensure backup and recovery procedures.', 72 , 'open');

console.log('Fence task removed. 3 software engineering tasks added.');
if (worker) {
    const demoTask = db.prepare(
        'INSERT INTO tasks (client_id, title, description, budget, status) VALUES (?, ?, ?, ?, ?)'
    ).run(client.id, 'API Performance Overhaul', 'Backend optimization project.', 8000, 'completed');

    db.prepare(
        'INSERT INTO reviews (task_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
    ).run(demoTask.lastInsertRowid, client.id, worker.id, 5, 'Delivered clean, well-tested code ahead of schedule. Excellent communication throughout the project.');

    console.log('Demo developer review added.');
} else {
    console.log('No worker user found yet, skipped adding review.');
}
