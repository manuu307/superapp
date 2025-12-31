const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const EnergyFlow = require('../models/EnergyFlow');
const mongoose = require('mongoose');

// @route   POST api/economy/beam
// @desc    Transfer lumens or rays to another user
// @access  Private
router.post('/beam', auth, async (req, res) => {
  const { recipientId, amount, currency } = req.body;

  if (!['lumens', 'rays'].includes(currency)) {
    return res.status(400).json({ msg: 'Invalid currency' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(req.user.id).session(session);
    const recipient = await User.findById(recipientId).session(session);

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    if (sender.id === recipient.id) {
      throw new Error('Cannot send to yourself');
    }

    if (sender.battery[currency] < amount) {
      throw new Error('Insufficient funds');
    }

    sender.battery[currency] -= amount;
    recipient.battery[currency] += amount;

    await sender.save({ session });
    await recipient.save({ session });

    const senderFlow = new EnergyFlow({
      user: sender.id,
      type: 'Beamed',
      direction: 'Outflow',
      [currency]: amount,
      notes: `Beamed to ${recipient.username}`,
      relatedUser: recipient.id
    });
    await senderFlow.save({ session });

    const recipientFlow = new EnergyFlow({
      user: recipient.id,
      type: 'Beamed',
      direction: 'Inflow',
      [currency]: amount,
      notes: `Beamed from ${sender.username}`,
      relatedUser: sender.id
    });
    await recipientFlow.save({ session });

    await session.commitTransaction();
    res.json({ msg: 'Transfer successful' });
  } catch (err) {
    await session.abortTransaction();
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    session.endSession();
  }
});

// @route   POST api/economy/convert
// @desc    Convert lumens to rays or rays to flares
// @access  Private
router.post('/convert', auth, async (req, res) => {
  const { from, to } = req.body;

  const validConversions = {
    lumens: { to: 'rays', rate: 100 },
    rays: { to: 'flares', rate: 100 }
  };

  if (!validConversions[from] || validConversions[from].to !== to) {
    return res.status(400).json({ msg: 'Invalid conversion' });
  }

  const { rate } = validConversions[from];

  try {
    const user = await User.findById(req.user.id);

    if (user.battery[from] < rate) {
      return res.status(400).json({ msg: 'Insufficient funds for conversion' });
    }

    user.battery[from] -= rate;
    user.battery[to] += 1;

    await user.save();

    const conversionFlow = new EnergyFlow({
        user: user.id,
        type: 'Converted',
        direction: 'Outflow',
        [from]: rate,
        notes: `Converted ${rate} ${from} to 1 ${to}`
    });
    await conversionFlow.save();


    res.json(user.battery);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/economy/discharge
// @desc    Convert flares to pending withdrawal
// @access  Private
router.post('/discharge', auth, async (req, res) => {
    const { amount } = req.body; // amount in Flares

    try {
        const user = await User.findById(req.user.id);

        if (user.battery.flares < amount) {
            return res.status(400).json({ msg: 'Insufficient flares' });
        }

        const tax = amount * 0.01;
        const netAmount = amount - tax;

        user.battery.flares -= amount;
        await user.save();
        
        // Here you would typically create a pending withdrawal request
        // For now, we'll just log it.
        
        const dischargeFlow = new EnergyFlow({
            user: user.id,
            type: 'Discharged',
            direction: 'Outflow',
            flares: amount,
            notes: `Discharged ${amount} Flares. Net amount: ${netAmount}, Tax: ${tax}`
        });
        await dischargeFlow.save();

        res.json({ msg: 'Discharge request successful', battery: user.battery });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
