const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true,
  },
  pricePaid: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Purchase', PurchaseSchema);