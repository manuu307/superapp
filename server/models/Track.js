const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priceEnergy: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  minioObjectKey: {
    type: String,
    required: true,
  },
  previewObjectKey: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Track', TrackSchema);
