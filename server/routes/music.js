const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const Minio = require('minio');
const mongoose = require('mongoose');
const Track = require('../models/Track');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

// Initialize Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});
console.log({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

const bucketName = process.env.MINIO_BUCKET;

// @route   POST api/v1/music/upload
// @desc    Upload a music file
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }

  const { title, priceEnergy, duration, isPublic } = req.body;
  if (!title || !priceEnergy || !duration) {
    return res.status(400).json({ msg: 'Please provide title, priceEnergy, and duration.' });
  }

  const fileName = `music/${Date.now()}_${req.file.originalname}`;
  const metaData = {
    'Content-Type': req.file.mimetype
  };

  minioClient.putObject(bucketName, fileName, req.file.buffer, metaData, async (err, etag) => {
    if (err) {
      console.error('MinIO upload error:', err);
      return res.status(500).send('Server Error');
    }

    try {
      const newTrack = new Track({
        title,
        authorId: req.user.id,
        priceEnergy: parseFloat(priceEnergy),
        duration: parseInt(duration, 10),
        minioObjectKey: fileName,
        isPublic: isPublic !== 'false',
      });

      const track = await newTrack.save();
      res.json(track);
    } catch (dbErr) {
      console.error('Database save error:', dbErr);
      // TODO: Implement a rollback mechanism for the MinIO upload if the DB save fails.
      res.status(500).send('Server Error');
    }
  });
});

// @route   GET api/v1/music/marketplace
// @desc    Get all public tracks
// @access  Public
router.get('/marketplace', async (req, res) => {
  try {
    const tracks = await Track.find({ isPublic: true })
      .populate('authorId', ['username', 'profilePicture'])
      .sort({ createdAt: -1 });
    res.json(tracks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/music/:id/preview
// @desc    Get a preview of a track
// @access  Public
router.get('/:id/preview', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // For simplicity, we'll generate a signed URL for the full track
    // and the client will be responsible for playing only the first 30 seconds.
    // In a real-world scenario, you might have a separate preview file
    // or use a more complex streaming solution to limit the preview.
    const objectKey = track.previewObjectKey || track.minioObjectKey;

    // Generate a presigned URL with a short expiration time (e.g., 5 minutes)
    minioClient.presignedGetObject(bucketName, objectKey, 5 * 60, (err, presignedUrl) => {
      if (err) {
        console.error('MinIO presigned URL error:', err);
        return res.status(500).send('Server Error');
      }
      const finalUrl = presignedUrl.replace('minio:9000', process.env.MINIO_PUBLIC_ENDPOINT);
      res.json({ url: finalUrl });
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Track not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/v1/music/:id/buy
// @desc    Buy a track
// @access  Private
router.post('/:id/buy', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const track = await Track.findById(req.params.id).session(session);
    if (!track) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Track not found' });
    }

    const buyer = await User.findById(req.user.id).session(session);
    if (!buyer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Buyer not found' });
    }
    
    if (buyer.id.toString() === track.authorId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'You cannot buy your own track' });
    }

    const existingPurchase = await Purchase.findOne({ userId: buyer.id, trackId: track.id }).session(session);
    if (existingPurchase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'You already own this track' });
    }

    if (buyer.energy < track.priceEnergy) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Insufficient energy' });
    }

    const author = await User.findById(track.authorId).session(session);
    if (!author) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Author not found' });
    }

    // Perform the energy transfer
    buyer.energy -= track.priceEnergy;
    author.energy += track.priceEnergy;

    await buyer.save({ session });
    await author.save({ session });

    const newPurchase = new Purchase({
      userId: buyer.id,
      trackId: track.id,
      pricePaid: track.priceEnergy,
    });

    await newPurchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ msg: 'Track purchased successfully' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/music/library
// @desc    Get user's purchased tracks
// @access  Private
router.get('/library', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.id })
      .populate({
        path: 'trackId',
        populate: {
          path: 'authorId',
          select: 'username profilePicture'
        }
      })
      .sort({ purchasedAt: -1 });

    const tracks = purchases.map(p => p.trackId);
    res.json(tracks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/v1/music/:id/stream
// @desc    Get a signed URL to stream a track
// @access  Private
router.get('/:id/stream', auth, async (req, res) => {
  try {
    const trackId = req.params.id;
    const userId = req.user.id;

    const purchase = await Purchase.findOne({ userId, trackId });
    if (!purchase) {
      return res.status(403).json({ msg: 'You do not own this track.' });
    }

    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // Generate a presigned URL with a short expiration time (e.g., 1 hour)
    minioClient.presignedGetObject(bucketName, track.minioObjectKey, 60 * 60, (err, presignedUrl) => {
      if (err) {
        console.error('MinIO presigned URL error:', err);
        return res.status(500).send('Server Error');
      }
      const finalUrl = presignedUrl.replace('minio:9000', process.env.MINIO_PUBLIC_ENDPOINT);
      res.json({ url: finalUrl });
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Track not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;