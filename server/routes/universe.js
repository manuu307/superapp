const express = require('express');
const router = express.Router();
const UserState = require('../models/UserState');

// @route   GET api/universe/states
// @desc    Get public and shared states
// @access  Public
router.get('/states', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const states = await UserState.find({
      visibility: { $in: ['public', 'shared'] }
    })
    .populate('user', 'name') // Return only user's name for privacy
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // For privacy, we only return a subset of information.
    // The user's ID is not exposed, only their name.
    // Private states are never returned.
    const safeStates = states.map(state => ({
      _id: state._id,
      color: state.color,
      polarity: state.polarity,
      tags: state.tags,
      description: state.description,
      media: state.media,
      createdAt: state.createdAt,
      user: state.user ? { name: state.user.name } : { name: 'Anonymous' }
    }));

    res.json(safeStates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
