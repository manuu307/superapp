const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single user
router.get('/:id', auth, getUser, (req, res) => {
  res.json(res.locals.user);
});

// UPDATE a user
router.put('/:id', auth, getUser, async (req, res) => {
  if (req.body.username != null) {
    res.locals.user.username = req.body.username;
  }
  if (req.body.email != null) {
    res.locals.user.email = req.body.email;
  }
  try {
    const updatedUser = await res.locals.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user
router.delete('/:id', auth, getUser, async (req, res) => {
  try {
    await res.locals.user.deleteOne();
    res.json({ message: 'Deleted User' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user's rooms
router.get('/:id/rooms', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id).select('-password');
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.locals.user = user;
  next();
}

module.exports = router;