const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  short_description: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  price_before: {
    type: Number,
    required: true
  },
  price_after: {
    type: Number,
    required: true
  },
  categories: [{
    type: String
  }],
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  }
});

module.exports = mongoose.model('Product', ProductSchema);
