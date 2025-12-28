const mongoose = require('mongoose');

const galaxySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  purpose: {
    type: String,
    trim: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  guests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
  tags: {
    type: [String],
    required: true,
    validate: [val => val.length > 0, 'At least one tag is required.'],
  },
  profileImage: {
    type: String,
    trim: true,
  },
  bannerImage: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Galaxy', galaxySchema);
