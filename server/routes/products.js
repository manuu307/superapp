const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Business = require('../models/Business');
const auth = require('../middleware/auth');

// @route   POST api/products
// @desc    Create a product for a business
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, short_description, description, picture, price_before, price_after, businessId } = req.body;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    if (business.owner.toString() !== req.user.id && !business.admins.map(admin => admin.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const newProduct = new Product({
      name,
      short_description,
      description,
      picture,
      price_before,
      price_after,
      business: businessId
    });

    const product = await newProduct.save();

    business.catalog.push(product.id);
    await business.save();

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/:businessId
// @desc    Get all products for a business
// @access  Public
router.get('/:businessId', async (req, res) => {
  try {
    const products = await Product.find({ business: req.params.businessId });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
