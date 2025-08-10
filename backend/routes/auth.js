require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "Email already registered" });

    const userId = 'MV2025-' + Math.floor(1000000 + Math.random() * 9000000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const qrCode = await QRCode.toDataURL(userId);

    user = new User({
      ...rest,
      email,
      password: hashedPassword,
      userId,
      qrCode
    });
    await user.save();

    res.json({ message: "User registered", userId, qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post('/login', async (req, res) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // ✅ Use `id` in payload to match middleware
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
//------------------------------------------------------------------------------

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const allowed = [
      'firstName','lastName','phone','dob','aadhaar','pan','address',
      'blood','conditions','medications','emergencyName','emergencyPhone',
      'primaryDoctor','insuranceProvider','organDonor'
    ];

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        
        const val = req.body[key];
        updates[key] = (typeof val === 'string') ? val.trim() : val;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
