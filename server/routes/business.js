const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const auth = require('../middleware/auth');

// @route   POST api/business
// @desc    Create a business
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, picture } = req.body;
    const owner = req.user.id;

    const newBusiness = new Business({
      name,
      owner,
      admins: [owner],
      picture
    });

    const business = await newBusiness.save();
    res.json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/business
// @desc    Get all businesses for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const businesses = await Business.find({
      $or: [{ owner: req.user.id }, { admins: req.user.id }]
    });
    res.json(businesses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
