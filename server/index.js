require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: '*' })); 
app.get('/api/v1/', (req, res) => res.send('Server is running'));
const userRoutes = require('./routes/users');
app.use('/api/v1/users', userRoutes);
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);
const roomRoutes = require('./routes/rooms');
app.use('/api/v1/rooms', roomRoutes);
const fileRoutes = require('./routes/files');
app.use('/api/v1/files', fileRoutes);
const businessRoutes = require('./routes/business');
app.use('/api/v1/business', businessRoutes);
const productRoutes = require('./routes/products');
app.use('/api/v1/products', productRoutes);
const galaxyRoutes = require('./routes/galaxies');
app.use('/api/v1/galaxies', galaxyRoutes);
const publicRoutes = require('./routes/public');
app.use('/api/v1/public', publicRoutes);
const videoRoutes = require('./routes/video');
app.use('/api/v1/video', videoRoutes);
const economyRoutes = require('./routes/economy');
app.use('/api/v1/economy', economyRoutes);

const circlesRoutes = require('./routes/circles');
app.use('/api/v1/circles', circlesRoutes);

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api-documentation.yaml');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Database Schema ---
const MessageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- Redis Setup ---
// The Redis host and port are pulled from the docker-compose environment variables
const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();

// --- Initialization ---
async function startServer() {
  
  // 1. Connect to MongoDB
  // The MONGO_URI is resolved via Docker network service name 'mongo'
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit if DB connection fails, as the service is unusable without persistence
    process.exit(1); 
  }

  // 2. Connect to Redis
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection error:', err);
    // Exit if Redis connection fails, as the service cannot scale/broadcast
    process.exit(1); 
  }


  // 3. Setup Socket.io
  const io = new Server(server, {
    // Allows connections from any origin (e.g., your React frontend)
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  // Apply the Redis adapter for horizontal scaling
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Socket.io adapter initialized with Redis.');

  // Socket.io authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded.user;
      next();
    } catch (err) {
      next(new Error('authentication error'));
    }
  });

  const userSockets = new Map();

  // 4. Socket.io Event Handling
  io.on('connection', (socket) => {
    // HOSTNAME is the Docker container ID, useful for debugging load balancing
    console.log(`[${process.env.HOSTNAME}] User connected: ${socket.id}`);

    // Store user's socket ID
    if (socket.user && socket.user.id) {
      userSockets.set(socket.user.id, socket.id);
    }

    // Event: User joins a room (e.g., 'General' or a 'Direct Message' ID)
    socket.on('join_room', async (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined ${room}`);
      
      try {
        // Add room to user's rooms list
        const user = await User.findById(socket.user.id);
        if (user && !user.rooms.includes(room)) {
          user.rooms.push(room);
          await user.save();
        }
    
        // Load last 50 messages from DB for history retrieval
        const history = await Message.find({ room }).sort({ timestamp: 1 }).limit(50);
        // Send history back to the specific client
        socket.emit('load_history', history); 
      } catch (e) {
        console.error('Error fetching history or saving room', e);
      }
    });

    // Event: User sends a new message
    socket.on('send_message', async (data) => {
      try {
        const user = await User.findById(socket.user.id);
        if (!user) {
          return; // Or handle error
        }
        // 1. Structure and Save to MongoDB
        const newMessage = new Message({
          room: data.room,
          sender: user.username, // Use authenticated user's email
          text: data.text
        });
        // Mongoose automatically adds _id and timestamp
        await newMessage.save();
    
        // 2. Broadcast to room across all instances (via Redis)
        // io.to(data.room) targets everyone in the room, including the sender
        io.to(data.room).emit('receive_message', newMessage); 
      } catch (e) {
        console.error('Error sending message', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
      if (socket.user && socket.user.id) {
        userSockets.delete(socket.user.id);
      }
    });
  });

  app.set('io', io);
  app.set('userSockets', userSockets);

  server.listen(port, () => {
    console.log(`Node.js Chat Server listening on port ${port}`);
  });
}

startServer();