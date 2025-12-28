const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Galaxy = require('../models/Galaxy');
const User = require('../models/User');

// @route   POST /api/v1/galaxies
// @desc    Create a new galaxy
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description, purpose, tags, managers, participants, guests, watchers, profileImage, bannerImage } = req.body;

  try {
    // Validate that tags are provided
    if (!tags || tags.length === 0) {
      return res.status(400).json({ msg: 'At least one tag is required.' });
    }

    const newGalaxy = new Galaxy({
      name,
      description,
      purpose,
      tags,
      admins: [req.user.id], // The creator is the first admin
      managers: managers || [],
      participants: participants || [],
      guests: guests || [],
      watchers: watchers || [],
      profileImage,
      bannerImage,
    });

    const galaxy = await newGalaxy.save();

    // Add this galaxy to the user's list of galaxies
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { galaxies: galaxy._id } });

    res.json(galaxy);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/v1/galaxies
// @desc    Get all galaxies a user is a member of
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const galaxies = await Galaxy.find({
      $or: [
        { admins: userId },
        { managers: userId },
        { participants: userId },
        { guests: userId },
        { watchers: userId }
      ]
    }).populate('admins managers participants', 'name username email');

    res.json(galaxies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/v1/galaxies/:id
// @desc    Get a galaxy by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
      const galaxy = await Galaxy.findById(req.params.id)
        .populate('admins', 'name username')
        .populate('managers', 'name username')
        .populate('participants', 'name username')
        .populate('guests', 'name username')
        .populate('watchers', 'name username')
        .populate('rooms', 'name');
  
      if (!galaxy) {
        return res.status(404).json({ msg: 'Galaxy not found' });
      }
  
      // Check if user is a member of the galaxy
      const userId = req.user.id;
      const isMember = 
        galaxy.admins.some(admin => admin._id.equals(userId)) ||
        galaxy.managers.some(manager => manager._id.equals(userId)) ||
        galaxy.participants.some(participant => participant._id.equals(userId)) ||
        galaxy.guests.some(guest => guest._id.equals(userId)) ||
        galaxy.watchers.some(watcher => watcher._id.equals(userId));
  
      if (!isMember) {
        return res.status(403).json({ msg: 'User not authorized to view this galaxy' });
      }
  
      res.json(galaxy);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Galaxy not found' });
      }
      res.status(500).send('Server Error');
    }
  });

// @route   PUT /api/v1/galaxies/:id
// @desc    Update a galaxy
// @access  Private (Admin or Manager only)
router.put('/:id', auth, async (req, res) => {
  const { name, description, purpose, tags, admins, managers, participants, guests, watchers, profileImage, bannerImage } = req.body;

  try {
    let galaxy = await Galaxy.findById(req.params.id);

    if (!galaxy) {
      return res.status(404).json({ msg: 'Galaxy not found' });
    }

    // Check if user is an admin or manager
    const userId = req.user.id;
    const isAuthorized = galaxy.admins.includes(userId) || galaxy.managers.includes(userId);

    if (!isAuthorized) {
      return res.status(403).json({ msg: 'User not authorized to update this galaxy' });
    }

    // Build galaxy object
    const galaxyFields = {};
    if (name) galaxyFields.name = name;
    if (description) galaxyFields.description = description;
    if (purpose) galaxyFields.purpose = purpose;
    if (tags) galaxyFields.tags = tags;
    if (admins) galaxyFields.admins = admins;
    if (managers) galaxyFields.managers = managers;
    if (participants) galaxyFields.participants = participants;
    if (guests) galaxyFields.guests = guests;
    if (watchers) galaxyFields.watchers = watchers;
    if (profileImage) galaxyFields.profileImage = profileImage;
    if (bannerImage) galaxyFields.bannerImage = bannerImage;

    galaxy = await Galaxy.findByIdAndUpdate(
      req.params.id,
      { $set: galaxyFields },
      { new: true }
    );

    res.json(galaxy);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/v1/galaxies/:id
// @desc    Delete a galaxy
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const galaxy = await Galaxy.findById(req.params.id);

    if (!galaxy) {
      return res.status(404).json({ msg: 'Galaxy not found' });
    }

    // Check if user is an admin
    if (!galaxy.admins.includes(req.user.id)) {
      return res.status(403).json({ msg: 'User not authorized to delete this galaxy' });
    }

    await galaxy.remove();

    res.json({ msg: 'Galaxy removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
