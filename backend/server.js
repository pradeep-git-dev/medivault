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

const __dirnameDir = path.resolve();
app.use(express.static(path.join(__dirnameDir, '/frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirnameDir, '/frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
