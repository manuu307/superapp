const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const User = require('../models/User');

// @route   GET api/rooms
// @desc    Get all rooms for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const rooms = await Room.find({
            name: { $in: user.rooms },
        }).populate('users', ['username', 'profilePicture']);

        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

// @route   POST api/rooms/one-to-one
// @desc    Create a 1-to-1 chat
// @access  Private
router.post('/one-to-one', auth, async (req, res) => {
  const { userId } = req.body;
  const createdBy = req.user.id;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID is required' });
  }

  try {
    // Check if a 1-to-1 chat already exists between these two users
    let room = await Room.findOne({
      isOneToOne: true,
      users: { $all: [createdBy, userId], $size: 2 },
    });

    if (room) {
      return res.json(room);
    }

    const newRoom = new Room({
      isOneToOne: true,
      isPrivate: true,
      users: [createdBy, userId],
      admins: [createdBy, userId],
      createdBy,
    });

    room = await newRoom.save();

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
