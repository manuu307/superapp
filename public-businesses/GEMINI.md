# Project Context: Scalable Distributed Chat Application

## Frontend for a social network application.

### notes and functionality by now:

- Login form
- Register form
- Chat: crate rooms (public or private) and chatting with contacts
- User Profile
- Business: The business part is a profile from a User that can create a catalog of products.
- Light/Dark theme
- Tailwind CSS, TypeScript, app routes, react context, Sock io

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

## 3. Frontend
- **Framework:** React
- **Entrypoint:** `client/src/app/index.tsx` renders the `App` component from `client/src/App.jsx`.
- **Main Component (`index.tsx`):**
    - Handles the authentication flow, showing login/register forms or the main chat application.
    - Manages the Socket.io connection.
    - Displays the list of rooms and the chat messages for the selected room.
- **Components:**
    - `client/src/components/Login.jsx`: Login form.
    - `client/src/components/Register.jsx`: Registration form.
- **To Do**
    - Protect de authenticated routes redirecting to "/login" if the token is expired or null
    - Investigate why the tailwind config is not affecting the styles when for example i toggle from light theme to dark theme (components/ThemeToggleButton.tsx)
## 4. User Authentication
- **JWT-based Authentication:** User registration and login are handled via REST endpoints (`/api/auth/register`, `/api/auth/login`). Upon successful authentication, a JSON Web Token (JWT) is issued.
- **Protected Routes:** API routes for user management (`/api/users`) are protected using a JWT middleware.
- **Socket.io Authentication:** The Socket.io connection is authenticated using the JWT, which is passed from the client. A middleware on the server verifies the token.
