require('dotenv').config(); // must be FIRST

const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Import Routes
const medicalRoutes = require('./routes/medical');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/medical', medicalRoutes);

// Correctly determine the absolute path to the frontend folder
// The __dirname variable points to the directory where this file (server.js) is located.
// We use '..' to go up one level from 'backend' to the project root,
// and then we go into the 'frontend' folder.
const frontendPath = path.join(__dirname, '..', 'frontend');

// Serve static assets from the frontend folder
app.use(express.static(frontendPath));

// Serve the index.html file for all other routes to enable client-side routing
// This must be placed after your API routes.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

