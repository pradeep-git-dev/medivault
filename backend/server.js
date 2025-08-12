require('dotenv').config(); // must be FIRST

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const medicalRoutes = require('./routes/medical');
const app = express();


app.use(express.json());
app.use(cors());


connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/medical', medicalRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


import path from 'path';

import express from 'express';

const app = express();

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, '/frontend')));

app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, '/frontend/index.html'));

});