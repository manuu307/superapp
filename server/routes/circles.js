const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Circle = require('../models/Circle');
const User = require('../models/User');

const { getNearbyEntities } = require('../controllers/circles');

// GET /api/v1/circles/nearby
// Get nearby circles and public events
router.get('/nearby', getNearbyEntities);

// GET /api/v1/circles
// Get all circles
router.get('/', auth, async (req, res) => {
  try {
    const circles = await Circle.find().populate('members', 'username profilePicture');
    res.json(circles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/v1/circles/:circleId/join
// Join a circle
router.post('/:circleId/join', auth, async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.id;
  const io = req.app.get('io');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const circle = await Circle.findById(circleId).session(session);
    const user = await User.findById(userId).session(session);

    if (!circle) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Circle not found' });
    }

    if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: 'User not found' });
    }

    if (user.battery.lumens < circle.entryFee) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Insufficient lumens' });
    }

    if (circle.members.includes(userId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: 'User already in this circle' });
    }

    // Perform the transaction
    user.battery.lumens -= circle.entryFee;
    circle.vault += circle.entryFee;
    circle.members.push(userId);

    await user.save({ session });
    await circle.save({ session });

    await session.commitTransaction();
    session.endSession();
    
    const populatedCircle = await Circle.findById(circleId).populate('members', 'username profilePicture');

    // Emit event
    io.emit('circle_growth', { circle: populatedCircle });

    res.json(populatedCircle);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
