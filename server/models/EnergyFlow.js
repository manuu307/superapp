const mongoose = require('mongoose');

const EnergyFlowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Harvested', 'Beamed', 'Discharged', 'Converted'],
    required: true
  },
  direction: {
    type: String,
    enum: ['Inflow', 'Outflow'],
    required: true
  },
  lumens: {
    type: Number,
    default: 0
  },
  rays: {
    type: Number,
    default: 0
  },
  flares: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EnergyFlow', EnergyFlowSchema);
