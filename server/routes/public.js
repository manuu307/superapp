const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Product = require('../models/Product');
const User = require('../models/User');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

// @route   GET api/v1/public/stores/:businessId
// @desc    Get public business data
// @access  Public
router.get('/stores/:businessId', async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    const products = await Product.find({ business: req.params.businessId });

    res.json({
      business,
      products
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/v1/public/chat/initiate
// @desc    Initiate a chat with a business
// @access  Public
router.post('/chat/initiate', async (req, res) => {
  const { name, email, businessId } = req.body;

  try {
    let guest = await User.findOne({ email, isGuest: true });

    if (!guest) {
      guest = new User({
        username: email,
        email,
        name,
        isGuest: true,
      });
      await guest.save();
    }

    let room = await Room.findOne({ business: businessId, guest: guest._id });

    if (!room) {
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ msg: 'Business not found' });
      }

      room = new Room({
        business: businessId,
        guest: guest._id,
        users: [guest._id, business.owner],
        admins: [business.owner],
        name: `${business.name}: ${guest.email} - ${Date.now()}`,
        isPrivate: true,
      });
      await room.save();
      
      await User.findByIdAndUpdate(guest._id, { $addToSet: { rooms: room.name } });
      await User.findByIdAndUpdate(business.owner, { $addToSet: { rooms: room.name } });

      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const ownerSocket = userSockets.get(business.owner.toString());

      if (ownerSocket) {
        io.to(ownerSocket).emit('new_room', room);
      }
    }

    const payload = {
      user: {
        id: guest.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, roomId: room._id, roomName: room.name, guest });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

