const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, uploadToMinio } = require('../middleware/file');

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }

  try {
    const { url } = await uploadToMinio(req.file);
    res.json({ url });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
