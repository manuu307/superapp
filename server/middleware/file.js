const multer = require('multer');
const Minio = require('minio');

// Initialize Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, GIFs and audio are allowed.'), false);
    }
  }
});

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

const uploadToMinio = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    const metaData = {
      'Content-Type': file.mimetype
    };

    minioClient.putObject(bucketName, fileName, file.buffer, metaData, (err, etag) => {
      if (err) {
        console.error('MinIO upload error:', err);
        return reject(new Error('MinIO upload error'));
      }
      const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.MINIO_ENDPOINT;
      const fileUrl = `http://${publicEndpoint}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
      let type = 'image';
      if (file.mimetype.startsWith('image/gif')) {
        type = 'gif';
      } else if (file.mimetype.startsWith('audio/')) {
        type = 'audio';
      }
      resolve({
        url: fileUrl,
        type,
       });
    });
  });
};

module.exports = { upload, uploadToMinio };
