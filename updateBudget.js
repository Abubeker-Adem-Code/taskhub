const db = require('./config/database');

db.prepare("UPDATE tasks SET budget = ? WHERE title = ?").run(25, 'Entry-Level Frontend Developer');
db.prepare("UPDATE tasks SET budget = ? WHERE title = ?").run(45, 'Senior Backend Developer');
db.prepare("UPDATE tasks SET budget = ? WHERE title = ?").run(60, 'Database Administrator');

console.log('Budgets updated to hourly rates.');
