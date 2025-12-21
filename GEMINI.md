# Project Context: Scalable Distributed Chat Application

## 1. Project Goal
To create a high-performance, real-time chat application that is horizontally scalable using a microservices architecture managed by Docker Compose. The application supports multiple concurrent users, user authentication, and data persistence across multiple backend instances.

## 2. Core Architecture
The system is composed of four main microservices, orchestrated by Docker Compose and accessed via a Load Balancer (Nginx).

| Service         | Technology                  | Role                                                                              | Network Access            |
|-----------------|-----------------------------|-----------------------------------------------------------------------------------|---------------------------|
| Backend Cluster | Node.js, Socket.io, Express | Application logic, WebSocket handling, API endpoints for users and authentication. | Internal (via Nginx proxy) |
| Message Broker  | Redis                       | High-speed Publish/Subscribe (Pub/Sub) system for inter-server communication.     | Internal Only             |
| Data Store      | MongoDB (Mongoose)          | Persistent storage for user data, room information, and message history.          | Internal Only             |
| Load Balancer   | Nginx                       | Entry point for all traffic (HTTP/WebSocket). Distributes load to Node.js instances. | External (Port 80)        |

## 3. User Authentication
- **JWT-based Authentication:** User registration and login are handled via REST endpoints (`/api/auth/register`, `/api/auth/login`). Upon successful authentication, a JSON Web Token (JWT) is issued.
- **Protected Routes:** API routes for user management (`/api/users`) are protected using a JWT middleware.
- **Socket.io Authentication:** The Socket.io connection is authenticated using the JWT, which is passed from the client. A middleware on the server verifies the token.

## 4. Key Scalability Mechanism: Redis Pub/Sub
The system achieves horizontal scaling (running multiple Node.js instances) using the `@socket.io/redis-adapter`.
- **Broadcast:** When a message is received by a Node instance, it first saves the message to MongoDB. Then, it uses Redis Pub/Sub to broadcast the message data to all other Node instances.
- **Delivery:** Each instance receives the message via Redis and delivers it to its locally connected clients via Socket.io.
- **Benefit:** This guarantees that users connected to any Node instance receive messages in real-time, allowing the backend to be scaled up by simply increasing the replica count in `docker-compose.yml`.

## 5. Data Persistence (MongoDB)
- **Users:** User accounts with hashed passwords and a list of joined rooms are stored in the `users` collection.
- **Messages:** All chat messages are persisted in the `messages` collection using Mongoose.
- **History Retrieval:** The `join_room` Socket.io event triggers a database query to load the last 50 messages for that room.

## 6. Room Management
- **Joining Rooms:** When a user joins a room, the room name is added to the user's `rooms` array in the database.
- **Room List:** The frontend fetches and displays the list of rooms the user has joined, allowing them to switch between rooms.

## 7. Backend
- **Entrypoint:** `server/index.js`
- **Models:**
    - `server/models/User.js`: Mongoose model for users.
    - The `Message` model is defined in `server/index.js`.
- **Routes:**
    - `server/routes/auth.js`: Authentication routes (register, login, get user from token).
    - `server/routes/users.js`: CRUD routes for user management.
- **Middleware:**
    - `server/middleware/auth.js`: JWT authentication middleware for protecting routes.

## 8. Frontend
- **Framework:** NextJs
- **Entrypoint:** `web-front/src/app/page.tsx`.
- **Main Component (`App.jsx`):**
    - Handles the authentication flow, showing login/register forms or the main chat application.
    - Manages the Socket.io connection.
    - Displays the list of rooms and the chat messages for the selected room.
- **Components:**
    - `client/src/components/Login.jsx`: Login form.
    - `client/src/components/Register.jsx`: Registration form.

## 9. B2C Chat Widget Implementation Summary

*   **Database:**
    *   The `User` model was updated to include an `isGuest` flag to differentiate between registered and guest users.
    *   The `Room` model was updated to include `business` and `guest` references for B2C chat rooms.
*   **Backend:**
    *   A new public API endpoint `POST /api/v1/public/chat/initiate` was created to allow guest users to initiate chats from public business profiles.
    *   The backend now uses Socket.io to send real-time notifications to business owners when a new chat room is created.
*   **Frontend (`public-businesses`):**
    *   A `BusinessChatWidget` component was created with a lead generation form and a real-time chat window.
    *   The widget was integrated into the `BusinessPublicProfile` page.
*   **Frontend (`web-app`):**
    *   The `SocialContext` was updated to listen for new room creation events, ensuring the business owner's chat list is updated in real-time.
