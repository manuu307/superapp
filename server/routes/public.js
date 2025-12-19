const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Product = require('../models/Product');

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

module.exports = router;
