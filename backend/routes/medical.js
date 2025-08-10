const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');


router.put('/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    
    const allowedFields = ['appointments', 'reports', 'medications', 'visits', 'doctors'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field]) {
        try {
          
          if (typeof req.body[field] === 'string') {
            updateData[field] = JSON.parse(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        } catch (err) {
          return res.status(400).json({ error: `Invalid JSON format for ${field}` });
        }
      }
    });

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Medical sections updated successfully', user });
  } catch (err) {
    console.error('Medical update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
