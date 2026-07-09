const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const express = require('express');
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api', applicationRoutes);
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
const fs = require('fs');
const path = require('path');

global.logAction = (action, details) => {
  const msg = `[${new Date().toISOString()}] ACTION: ${action} | DETAILS: ${JSON.stringify(details)}\n`;
  fs.appendFileSync(path.join(__dirname, 'app.log'), msg);
};
