const mongoose = require('mongoose');

const UserStateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  color: {
    type: String,
    required: true,
    enum: ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white'],
  },
  polarity: {
    type: String,
    required: true,
    enum: ['+', '-'],
    default: '-',
  },
  tags: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    default: 'private',
    enum: ['private', 'shared', 'public'],
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserState', UserStateSchema);
