const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const User = require('../models/User');

// @route   POST api/rooms
// @desc    Create a room
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description, isPrivate, tags, users, admins } = req.body;
  const createdBy = req.user.id;

  try {
    const newRoom = new Room({
      name,
      description,
      isPrivate,
      tags,
      createdBy,
      users: [createdBy, ...(users || [])],
      admins: [createdBy, ...(admins || [])],
    });

    const room = await newRoom.save();

    // Add the room to each user's room list
    await User.updateMany(
      { _id: { $in: newRoom.users } },
      { $addToSet: { rooms: room.name } }
    );

    res.json(room);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


