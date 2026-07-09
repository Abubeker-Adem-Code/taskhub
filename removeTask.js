const db = require('./config/database');

const fenceTasks = db.prepare("SELECT id, title FROM tasks WHERE title LIKE '%fence%'").all();

console.log(`Found ${fenceTasks.length} fence task(s):`, fenceTasks);

fenceTasks.forEach(task => {
    db.prepare("DELETE FROM reviews WHERE task_id = ?").run(task.id);
    db.prepare("DELETE FROM applications WHERE task_id = ?").run(task.id);
    db.prepare("DELETE FROM tasks WHERE id = ?").run(task.id);
    console.log(`Deleted task id ${task.id}: "${task.title}"`);
});

console.log('Done.');
