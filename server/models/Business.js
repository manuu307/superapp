const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  catalog: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  picture: {
    type: String,
    default: ''
  },
  bannerMedia: {
    type: String,
    default: ''
  },
  aboutUs: {
    type: String,
    default: ''
  },
  deliveryAvailable: {
    type: Boolean,
    default: false
  },
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true
  },
  openDaysHours: [{
    dayOfWeek: String,
    openTime: String,
    closeTime: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Business', BusinessSchema);
