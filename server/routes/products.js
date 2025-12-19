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
    const { name, short_description, description, picture, price_before, price_after, businessId, categories } = req.body;

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
      business: businessId,
      categories
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

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, short_description, description, picture, price_before, price_after, categories } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const business = await Business.findById(product.business);

    if (business.owner.toString() !== req.user.id && !business.admins.map(admin => admin.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    product.name = name || product.name;
    product.short_description = short_description || product.short_description;
    product.description = description || product.description;
    product.picture = picture || product.picture;
    product.price_before = price_before || product.price_before;
    product.price_after = price_after || product.price_after;
    product.categories = categories || product.categories;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const business = await Business.findById(product.business);

    if (business.owner.toString() !== req.user.id && !business.admins.map(admin => admin.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
