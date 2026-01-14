const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserState = require('../models/UserState');

const { upload, uploadToMinio } = require('../middleware/file');

// @route   POST api/v1/me/state
// @desc    Create a state entry
// @access  Private
router.post('/state', [auth, upload.single('media')], async (req, res) => {
  try {
    const { color, polarity, tags, description, visibility, sharedWith } = req.body;
    
    let mediaData;
    if (req.file) {
      try {
        mediaData = await uploadToMinio(req.file);
      } catch (uploadError) {
        return res.status(500).send(uploadError.message);
      }
    }

    const newState = new UserState({
      user: req.user.id,
      color,
      polarity,
      tags: tags ? tags.split(',') : [],
      description,
      visibility,
      sharedWith: sharedWith ? sharedWith.split(',') : [],
      media: mediaData,
    });
    const userState = await newState.save();
    res.json(userState);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/me/states
// @desc    Get user states
// @access  Private
router.get('/states', auth, async (req, res) => {
  try {
    const states = await UserState.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(states);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/me/stats
// @desc    Get aggregated data for charts
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { time_range } = req.query;
    let startDate = new Date();
    if (time_range === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (time_range === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (time_range === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate = new Date(0); // all time
    }

    const stats = await UserState.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { color: '$color', polarity: '$polarity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const colorDistribution = stats.reduce((acc, stat) => {
      const key = `${stat._id.color} (${stat._id.polarity})`;
      acc[key] = stat.count;
      return acc;
    }, {});

    let positive = 0;
    let negative = 0;

    stats.forEach(stat => {
      if (stat._id.polarity === '+') {
        positive += stat.count;
      } else {
        negative += stat.count;
      }
    });

    res.json({
      colorDistribution,
      balance: {
        positive,
        negative,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/v1/me/state/:id
// @desc    Update visibility
// @access  Private
router.patch('/state/:id', auth, async (req, res) => {
  try {
    const { visibility, sharedWith } = req.body;
    let state = await UserState.findById(req.params.id);
    if (!state) return res.status(404).json({ msg: 'State not found' });

    // Make sure user owns the state
    if (state.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    state = await UserState.findByIdAndUpdate(
      req.params.id,
      { $set: { visibility, sharedWith } },
      { new: true }
    );

    res.json(state);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/v1/me/state/:id
// @desc    Delete a state entry
// @access  Private
router.delete('/state/:id', auth, async (req, res) => {
  try {
    let state = await UserState.findById(req.params.id);
    if (!state) return res.status(404).json({ msg: 'State not found' });

    // Make sure user owns the state
    if (state.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await UserState.findByIdAndRemove(req.params.id);

    res.json({ msg: 'State removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
