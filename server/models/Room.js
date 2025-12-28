const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  galaxy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Galaxy'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  watchers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guests: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    trim: true,
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RoomSchema.pre('save', function(next) {
  if (!this.name) {
    this.name = `chat-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
