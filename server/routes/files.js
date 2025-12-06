const express = require('express');
const router = express.Router();
const multer = require('multer');
const Minio = require('minio');
const auth = require('../middleware/auth');

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

const bucketName = process.env.MINIO_BUCKET;

// Ensure the bucket exists
minioClient.bucketExists(bucketName, (err, exists) => {
  if (err) {
    return console.log(err);
  }
  if (!exists) {
    minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
      if (err) return console.log('Error creating bucket.', err);
      console.log(`Bucket created successfully in "us-east-1".`);
      
      // Set public access policy
      const policy = `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": ["arn:aws:s3:::${bucketName}/*"]
          }
        ]
      }`;
      minioClient.setBucketPolicy(bucketName, policy, (err) => {
        if (err) return console.log('Error setting bucket policy.', err);
        console.log('Bucket policy set to public.');
      });
    });
  }
});

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }

  const fileName = `${Date.now()}_${req.file.originalname}`;
  const metaData = {
    'Content-Type': req.file.mimetype
  };

  minioClient.putObject(bucketName, fileName, req.file.buffer, metaData, (err, etag) => {
    if (err) {
      console.error('MinIO upload error:', err);
      return res.status(500).send('Server Error');
    }
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT;
    const fileUrl = `http://${publicEndpoint}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
    res.json({ url: fileUrl });
  });
});

module.exports = router;
