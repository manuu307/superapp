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

// @route   PUT api/business/:id
// @desc    Update a business
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, picture } = req.body;
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    business.name = name || business.name;
    business.picture = picture || business.picture;

    await business.save();
    res.json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/business/:id
// @desc    Delete a business
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Business.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Business removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
