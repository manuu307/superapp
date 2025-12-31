# Scalable Distributed Chat Application

This project implements a scalable, real-time chat application using a microservices architecture orchestrated with Docker Compose.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Running the Application](#running-the-application)
4. [Accessing MongoDB](#accessing-mongodb)
    - [Connecting to MongoDB](#connecting-to-mongodb)
    - [Querying Data](#querying-data)
5. [Frontend Development](#frontend-development)
6. [Backend Development](#backend-development)

## Project Overview
The goal of this project is to create a high-performance, real-time chat application that can scale horizontally. It supports multiple concurrent users, user authentication, and data persistence across multiple backend instances.

## Architecture
The system is composed of four main microservices:
- **Backend Cluster (Node.js, Socket.io, Express):** Handles application logic, WebSocket connections, and API endpoints.
- **Message Broker (Redis):** Provides a high-speed Publish/Subscribe (Pub/Sub) system for inter-server communication, enabling horizontal scaling.
- **Data Store (MongoDB):** Persistent storage for user data, room information, and message history.
- **Load Balancer (Nginx):** Acts as the entry point for all traffic, distributing HTTP and WebSocket connections to the Node.js instances.

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Setup
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd superapp
   ```

### Running the Application
To start all services, navigate to the root directory of the project and run:
```bash
docker-compose up --build
```
This command will build the Docker images (if not already built) and start all the containers.
The application will be accessible via `http://localhost`.

## Accessing MongoDB

### Connecting to MongoDB
You can connect to the MongoDB instance running in a Docker container. First, find the name of your MongoDB container:
```bash
docker ps --filter "name=mongodb"
```
Look for a container named something like `superapp-mongodb-1` or similar. Once you have the container name, you can access the `mongosh` shell:
```bash
docker exec -it <mongodb_container_name> mongosh
```
Replace `<mongodb_container_name>` with the actual name of your MongoDB container.

### Querying Data
Once connected to the `mongosh` shell, you can perform database operations.

**List databases:**
```javascript
show dbs
```

**Switch to a database (e.g., `chat_app`):**
```javascript
use chat_app
```

**List collections (tables) in the current database:**
```javascript
show collections
```

**Querying the `users` collection:**
- Find all users:
  ```javascript
  db.users.find({})
  ```
- Find a user by username:
  ```javascript
  db.users.find({ username: "testuser" })
  ```

**Querying the `messages` collection:**
- Find all messages:
  ```javascript
  db.messages.find({})
  ```
- Find messages in a specific room:
  ```javascript
  db.messages.find({ room: "general" })
  ```

**Querying the `rooms` collection:**
- Find all rooms:
  ```javascript
  db.rooms.find({})
  ```
- Find a room by name:
  ```javascript
  db.rooms.find({ name: "general" })
  ```

## Frontend Development
The frontend is a React application located in the `web-app/` directory.

To run the frontend independently (for development purposes, outside of Docker Compose):
1. Navigate to the frontend directory:
   ```bash
   cd web-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
The frontend will typically run on `http://localhost:3000`.

## Backend Development
The backend is a Node.js application located in the `server/` directory.

To run the backend independently (for development purposes, outside of Docker Compose):
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
The backend will typically run on `http://localhost:5000` (or as configured).


db.users.updateOne({"username": "Andu"},{$inc:{"battery.lumens": 1000}})
