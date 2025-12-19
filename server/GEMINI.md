# Project Context: Superapp API

## 1. Project Goal
To create a high-performance, real-time "Superapp" with a Node.js backend. The application supports multiple concurrent users, user authentication, business and product management, real-time chat, and file uploads.

## 2. Core Architecture
The system is a monolithic Node.js application with a RESTful API and a real-time component using WebSockets.

| Service         | Technology                  | Role                                                                              |
|-----------------|-----------------------------|-----------------------------------------------------------------------------------|
| API Backend     | Node.js, Express            | Application logic, API endpoints for users, businesses, products, rooms, and files. |
| Real-time Chat  | Socket.io                   | WebSocket handling for real-time chat functionality.                              |
| Data Store      | MongoDB (Mongoose)          | Persistent storage for user data, business information, products, rooms, and message history. |
| File Storage    | MinIO                       | S3-compatible object storage for file uploads.                                    |
| Authentication  | JWT                         | JSON Web Token-based authentication for securing API endpoints.                   |

## 3. User Authentication
- **JWT-based Authentication:** User registration and login are handled via REST endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`). Upon successful authentication, a JSON Web Token (JWT) is issued.
- **Protected Routes:** API routes for user management (`/api/v1/users`), business management (`/api/v1/business`), product management (`/api/v1/products`), room management (`/api/v1/rooms`), and file uploads (`/api/v1/files`) are protected using a JWT middleware.
- **Socket.io Authentication:** The Socket.io connection is authenticated using the JWT, which is passed from the client. A middleware on the server verifies the token.

## 4. Key Features

### 4.1. Business Management
- **Create Business:** Users can create a new business, becoming the owner and an admin by default.
- **Get Businesses:** Users can retrieve a list of all businesses they own or are an admin of.

### 4.2. Product Management
- **Create Product:** Authorized users (business owners or admins) can create products for a specific business.
- **Get Products:** All products for a given business can be retrieved.

### 4.3. Room Management (Chat)
- **Create Room:** Users can create public or private chat rooms, inviting other users.
- **Real-time Messaging:** Users can send and receive messages in real-time within the rooms they have joined.
- **Message History:** The last 50 messages of a room are loaded when a user joins.

### 4.4. User Management
- **User Profile:** Users can update their profile information.
- **User Search:** Users can search for other users.
- **Contact List:** Users can add and remove other users from their contact list.
- **Profile Picture:** Users can update their profile picture by providing a URL.
- **User Catalog:** Each user has a personal catalog of up to 10 items, which they can create, update, and delete.

### 4.5. File Uploads
- **Upload File:** Authenticated users can upload files, which are stored in a MinIO bucket. The endpoint returns the public URL of the uploaded file.

## 5. API Documentation
- **Swagger Documentation:** The API is documented using OpenAPI 3.0. The documentation is available at the `/api-docs` endpoint, served by `swagger-ui-express`. The documentation is defined in the `api-documentation.yaml` file.

## 6. Backend
- **Entrypoint:** `index.js`
- **Models:**
    - `models/User.js`: Mongoose model for users.
    - `models/Business.js`: Mongoose model for businesses.
    - `models/Product.js`: Mongoose model for products.
    - `models/Room.js`: Mongoose model for rooms.
    - The `Message` model is defined in `index.js`.
- **Routes:**
    - `routes/auth.js`: Authentication routes (register, login, get user from token).
    - `routes/users.js`: CRUD routes for user management.
    - `routes/business.js`: CRUD routes for business management.
    - `routes/products.js`: CRUD routes for product management.
    - `routes/rooms.js`: CRUD routes for room management.
    - `routes/files.js`: File upload routes.
- **Middleware:**
    - `middleware/auth.js`: JWT authentication middleware for protecting routes.
