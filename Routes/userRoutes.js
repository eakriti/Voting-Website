const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken } = require('../jwt');

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    if (data.role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({ error: 'Admin already exists' });
      }
    }

    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res.status(400).json({ error: 'Aadhar must be 12 digits' });
    }

    const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User(data);
    const savedUser = await newUser.save();

    const token = generateToken({ id: savedUser._id });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: savedUser
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    const user = await User.findOne({ aadharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
