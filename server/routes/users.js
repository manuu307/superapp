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

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, lastname, nickname, tags, description, website } = req.body;
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.name = name || user.name;
    user.lastname = lastname || user.lastname;
    user.nickname = nickname || user.nickname;
    user.tags = tags || user.tags;
    user.description = description || user.description;
    user.website = website || user.website;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude self
    }).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a contact
router.post('/contacts/add/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const contactToAdd = await User.findById(req.params.userId);

    if (!contactToAdd) {
      return res.status(404).json({ msg: 'User to add not found' });
    }

    if (user.contacts.includes(contactToAdd._id)) {
      return res.status(400).json({ msg: 'User is already in contacts' });
    }

    user.contacts.push(contactToAdd._id);
    await user.save();
    res.json(user.contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove a contact
router.delete('/contacts/remove/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.contacts = user.contacts.filter(
      contactId => contactId.toString() !== req.params.userId
    );
    await user.save();
    res.json(user.contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update profile picture
router.put('/profile-picture', auth, async (req, res) => {
  try {
    const { url } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.profilePicture = url;
    await user.save();
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a catalog item
router.post('/catalog', auth, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.catalog.length >= 10) {
      return res.status(400).json({ msg: 'Catalog cannot exceed 10 items' });
    }

    user.catalog.push({ title, description, mediaUrl, mediaType });
    await user.save();
    res.json(user.catalog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a catalog item
router.put('/catalog/:itemId', auth, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const item = user.catalog.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ msg: 'Catalog item not found' });
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.mediaUrl = mediaUrl || item.mediaUrl;
    item.mediaType = mediaType || item.mediaType;

    await user.save();
    res.json(user.catalog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a catalog item
router.delete('/catalog/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.catalog.pull(req.params.itemId);

    await user.save();
    res.json(user.catalog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const EnergyFlow = require('../models/EnergyFlow');

// GET energy flow history for the user
router.get('/energy-flow', auth, async (req, res) => {
  try {
    const history = await EnergyFlow.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;