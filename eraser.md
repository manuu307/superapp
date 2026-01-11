Take all this information as context, and create a super document for technical, non technical people and ensure to be convincent to convince the other person that this is a great idea

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


Lumen "Sponsored Actions" (Ads Program)
Instead of traditional banner ads, Lumen uses Incentivized Engagement. Companies pay to "buy" the attention of the grid, and that payment goes directly toward reducing user energy bills.
1. The "Ad-as-a-Subsidy" Model
The Mechanic: A user opens their wallet and sees: "Watch a 30-second educational video from [Brand] to earn 5 Lumens toward your next recharge."
The Flow: Brand Pays USD -> Lumen buys 5 Lumens from Reserve -> User receives Lumens -> User pays for Electricity.
Impact: The brand is literally "paying the light bill" for a family in need.
2. High-Value Ad Categories
To maintain the "Social Grid" ethos, we prioritize specific types of content:
Financial Literacy: Banks sponsoring modules on saving or credit.
Public Health: Government or Pharma sponsoring vaccination reminders.
Sustainable Habits: UTE or appliance brands teaching energy efficiency.
3. Corporate Value: Hyper-Local Targeting
Because every Solar Hub is geographically tied to a neighborhood, companies can run hyper-local campaigns:
Example: A local supermarket in Casavalle can offer a discount coupon only to users connected to the "Casavalle North Hub."
4. Revenue Sharing
70% User Subsidy: Direct credit to the user's wallet.
20% Infrastructure Fund: Maintenance of the solar panels.
10% Platform Fee: Operational costs for Lumen.


Lumen: Corporate Investment & Solvency Framework
This framework integrates institutional capital entry points with the rigorous financial safeguards required to maintain trust in the Social Grid.
1. Business Value Proposition (The "ROI")
To attract corporate money, we move beyond philanthropy toward Strategic Asset Management.
A. COMAP & Tax Optimization
In Uruguay, investments in renewable energy and social inclusion projects can be channeled through COMAP to obtain IRAE (Income Tax) exemptions.
Mechanism: Corporations fund the installation of Solar Hubs.
Outcome: 100% of the investment can often be recovered via tax credits over a period of 5-10 years.
B. ESG & Carbon Credits
Large firms (Ex: UTE, Conaprole, Banks) need to report ESG (Environmental, Social, Governance) progress.
Green Certificates: Every MWh generated by a sponsored hub provides the company with a verifiable Carbon Offset report.
Social Impact: Direct metrics on "Energy Poverty Reduction" (Families lifted from debt).
C. The "Adopt-a-Neighborhood" Program
Branding: Companies sponsor a specific geographic hub (e.g., "The [Brand] Solar Hub").
Engagement: The company logo appears in the digital wallets of every user connected to that hub, creating positive brand sentiment.
2. Liquidity & Reserve Strategy
To ensure the business's money is safe and the "Lumen" maintains its value, we implement a Tri-Tier Reserve.
Tier
Name
Composition
Purpose
Tier 1
Operational Buffer
10% Cash (UYU/USD)
Immediate user cash-outs and maintenance.
Tier 2
Solvency Reserve
40% Liquid Assets
1:1 backing for all Lumens in circulation.
Tier 3
Growth Fund
50% Energy Assets
Value of hardware (Panels/Batteries) and long-term PPA contracts.
3. Solvency Monitor (The Trust Engine)
A public-facing audit tool that proves every Lumen is backed by real value.
Audit Logic: (Cash Reserves + Value of Energy Produced) / Total Lumens in Circulation >= 1.0
Proof of Energy: IoT data from solar inverters feeds directly into the monitor, proving that the "collateral" (electricity) is being generated in real-time.
4. Implementation Roadmap
Phase 1: Launch the Investor Dashboard to showcase real-time impact to potential partners.
Phase 2: Integrate COMAP Reporting tools to automate tax benefit documentation.
Phase 3: Enable Secondary Market for businesses to trade or "Airdrop" energy credits to employees as "Green Benefits."


Project Omni: The Complete Documentation
1. Project Vision & Concept (The "Why")
Project Omni is a comprehensive ecosystem designed to bridge the gap between digital data and physical location. It is a multi-layered platform that allows users to interact with "Circles" (entities/locations) that possess dynamic traits, primarily Energy.
Unlike standard directory apps, Omni creates a living digital twin of a geographic area where the "pulse" of a city is dictated by real-time data injections.
2. Technical Architecture (The "How")
For Developers and Technical Stakeholders
A. The Core Stack
Environment: Node.js runtime.
Database: MongoDB with a focus on Geospatial indexing (2dsphere). This allows for complex queries like "find all circles within a 5km radius."
API Design: RESTful architecture with JSON payloads.
B. Data Models
Circles (The Base Unit):
_id: Unique identifier.
name: Display name.
location: GeoJSON object { type: "Point", coordinates: [lng, lat] }.
category: Tags for filtering (e.g., "Retail", "Community", "Event").
baseEnergy: The static energy floor of a circle.
currentEnergy: The dynamic, calculated energy.
Energy Logs & Transactions:
Tracked to allow for historical analysis and "decay" logic (energy dissipating over time).
C. Advanced Algorithms
Weighted Ranking: The system uses a custom formula to sort results. Instead of a linear distance sort, it uses:
$$Score = \frac{Energy}{Distance}$$
Geospatial Clustering: Logic to group circles when the user zooms out, preventing UI clutter while maintaining "Energy" visibility.
3. Business & User Experience (The "What")
For Non-Technical Stakeholders and Product Managers
A. The User Journey
Discovery: Users open the map and see "Circles" radiating different colors or sizes based on their Energy.
Interaction: Users can "boost" a circle, check-in, or view content hosted within that specific geographic boundary.
Creation: Verified users or businesses can "spawn" their own circles to host events or promote services.
B. The "Energy" Economy
Energy is the primary currency of attention within the app.
High Energy: Indicates a trending spot, a sponsored location, or a high-traffic event.
Low Energy: Indicates a quiet, private, or newly created spot.
C. Key Features
Hyperlocal Filtering: Find exactly what is happening within a 5-minute walk.
Real-Time Map: The map updates as circles gain or lose energy, providing a "weather report" for social activity.
4. The Corporate Pitch (The Value Proposition)
For Potential Partners and Investors
The Market Gap
Current location services (Google, Yelp) are archival—they tell you what was there. Project Omni is ephemeral—it tells you what is happening now.
Competitive Advantages
Dynamic Visibility: Businesses no longer rely solely on SEO or reviews. They can use "Energy Injections" to gain instant visibility during slow hours.
High Engagement: The gamified nature of "Energy" encourages users to visit locations to help maintain their "pulse" on the map.
Data Goldmine: Omni collects unique "Intent-to-Visit" data that exceeds standard GPS tracking by measuring how "Energy" shifts influence physical movement.
Revenue Streams
Sponsored Energy: Businesses pay for temporary boosts in the ranking algorithm.
Premium Circles: Custom branding and advanced analytics for high-tier enterprise users.
API Access: Selling real-time "Social Heatmap" data to urban planners and logistics companies.
5. Development History & Roadmap
Phase 1 (Foundations): Setup of the MongoDB Geo-schema and basic CRUD for Circles.
Phase 2 (The Energy Engine): Implementation of the ranking algorithm and real-time energy calculation.
Phase 3 (Frontend/UI): Development of the interactive map and discovery feed (Current Status).
Phase 4 (Expansion): Integration of social features (comments/media) within Circles.
Document Version: 2.0 (Full Project Comprehensive)


----------


You are a senior full-stack engineer working on an existing platform with:

- Node.js + Express
- MongoDB
- JWT authentication
- A Next.js frontend
- Existing user profiles (to be renamed to "Me")

Your task is to START IMPLEMENTING a new feature called
**Personal State Tracking**, accessible from a section called **“Me”**.

This feature allows users to track their physical and emotional states
over time in a simple, non-medical, private-by-default way.

================================
CORE CONCEPT
================================

A "State" represents how a user feels at a specific moment in time.

This is NOT a medical or diagnostic feature.
Do NOT introduce scoring, AI interpretation, or advice.

Focus on:
- Self-observation
- Patterns over time
- Visual clarity
- Privacy

================================
STATE ENTRY REQUIREMENTS
================================

Each State entry MUST include:

1. Timestamp (automatic)
2. ONE primary emotion represented by a COLOR (mandatory)
3. Optional descriptive WORD TAGS (multiple allowed)
4. Optional short free-text description
5. Visibility level (private by default)

================================
COLOR SYSTEM (MANDATORY)
================================

User must select EXACTLY ONE color.

Suggested fixed color set (can be constants):

- red    → anger / frustration
- blue   → sadness / low
- yellow → joy / energy
- green  → calm / balance
- purple → creativity / reflection
- black  → exhaustion / overload
- white  → neutral / empty

Colors are symbolic, not diagnostic.

================================
WORD TAGS (OPTIONAL)
================================

Users may select zero or more tags, such as:

- angriness
- sadness
- sickness
- creativity
- motivation
- energy
- anxiety
- calm
- focus
- confusion

These are descriptive, not evaluative.

================================
VISIBILITY
================================

Each state entry has a visibility field:

- "private" (default)
- "shared" (with specific users)
- "public"

Do NOT make states public by default.

================================
DATA MODELS (REQUIRED)
================================

Design MongoDB schemas for:

1. UserState
- id
- userId
- color
- tags []
- description
- visibility
- createdAt

Optional:
- sharedWith [userId]

================================
API ENDPOINTS (REQUIRED)
================================

Implement (or scaffold):

- POST   /api/v1/me/state        → create a state entry
- GET    /api/v1/me/states       → list user states (filter by date range)
- GET    /api/v1/me/stats        → aggregated data for charts
- PATCH  /api/v1/me/state/:id   → update visibility
- DELETE /api/v1/me/state/:id   → delete entry

All endpoints MUST be JWT-protected.

================================
AGGREGATION & ANALYTICS
================================

Implement basic aggregation queries for:

1. Weekly / Monthly / Yearly views
2. Color distribution over time
3. Positive vs Negative balance

Define:
- Positive colors: yellow, green, purple
- Negative colors: red, blue, black
- Neutral: white

Return data in a frontend-friendly format
(no charting library code required).

================================
FRONTEND (BASIC SCAFFOLD)
================================

- Rename "Profile" section to "Me"
- Inside "Me" section, Add:
  - Simple state entry form
  - Color selector (single choice)
  - Tag selector (multi-choice)
  - Optional text input
- Add placeholder views for:
  - Weekly view
  - Monthly view
  - Yearly view

Do NOT over-design UI.
Focus on structure and data flow.

================================
DELIVERABLES
================================

1. MongoDB schema(s)
2. Express routes + controllers
3. Aggregation logic
4. Minimal frontend scaffolding
5. Inline comments explaining design choices

================================
IMPORTANT
================================

- Privacy first
- Simplicity over features
- Assume future integration with:
  - Lumen (energy)
  - Omni (location aggregation)
  - Social sharing

Start with a clean MVP and begin implementation now.

-------------

You are a senior full-stack engineer working on an existing feature called
**Personal State Tracking** (“Me” section), already implemented and working.

Current behavior:
- User selects EXACTLY ONE color to represent their state
- Colors have a single, fixed symbolic meaning

Your task is to IMPLEMENT A NEW CONCEPT called **Polarity**
that modifies the meaning of the selected color.

================================
NEW CONCEPT: POLARITY
================================

Each state entry must now include a POLARITY value:

- "+"  → positive expression of the color
- "-"  → negative expression of the color

Polarity is REQUIRED and selected explicitly by the user.

This does NOT change the color itself,
only how the color is interpreted.

================================
SEMANTIC MODEL (IMPORTANT)
================================

Colors are ambiguous by nature.
Polarity disambiguates meaning.

Example:

RED color meanings:
- Positive (+): passion, love, desire, vitality
- Negative (-): anger, danger, conflict, war

Other examples (illustrative, not medical):

BLUE
- + : serenity, depth, introspection
- - : sadness, heaviness, loneliness

YELLOW
- + : joy, optimism, energy
- - : anxiety, restlessness, overload

GREEN
- + : calm, balance, growth
- - : stagnation, envy, emotional flatness

PURPLE
- + : creativity, imagination, reflection
- - : confusion, dissociation, mental fog

BLACK
- + : rest, silence, withdrawal, protection
- - : exhaustion, burnout, overwhelm

WHITE
- + : clarity, openness, neutrality
- - : emptiness, numbness, detachment

Do NOT hardcode meanings into logic.
Meanings are conceptual, not programmatic.

================================
DATA MODEL CHANGE (REQUIRED)
================================

Extend the existing UserState schema:

Add field:
- polarity: "+" | "-"

Existing states WITHOUT polarity must be handled gracefully:
- Either default to null
- Or default to "-" (document decision)

Do NOT break existing data.

================================
API CHANGES
================================

Update relevant endpoints to:

- Accept polarity on state creation
- Return polarity in all state responses
- Include polarity in aggregation queries

Affected endpoints:
- POST /api/v1/me/state
- GET  /api/v1/me/states
- GET  /api/v1/me/stats

================================
AGGREGATION LOGIC UPDATE
================================

Update analytics to consider polarity:

1. Positive states:
   - polarity "+"
2. Negative states:
   - polarity "-"

Do NOT infer positivity from color anymore.
Color and polarity are orthogonal.

Charts should be able to show:
- Positive vs Negative over time
- Color distribution WITH polarity awareness

================================
FRONTEND UPDATE (REQUIRED)
================================

Update the state entry UI:

- Add a polarity selector:
  - Two options: "+" and "-"
  - Mutually exclusive
  - Required before saving

UX guidelines:
- Simple toggle or segmented control
- No judgmental language
- No icons like smiley/sad faces
- Neutral wording (e.g. “Expression” or “Tone”)

Ensure:
- Color selection remains single-choice
- Polarity selection is mandatory
- Existing tags and description remain unchanged

================================
BACKWARD COMPATIBILITY
================================

- Existing saved states without polarity must still render
- In UI, show them as:
  - “unspecified”
  - or default polarity (document choice)

================================
CONSTRAINTS
================================

- No medical interpretation
- No AI inference
- No automatic polarity assignment
- User always chooses polarity explicitly

================================
DELIVERABLES
================================

1. Updated MongoDB schema
2. Migration or fallback strategy for existing data
3. Updated API controllers
4. Updated aggregation logic
5. Frontend UI changes
6. Inline comments explaining semantic decisions

================================
IMPORTANT
================================

- This is a semantic refinement, not a new feature
- Preserve simplicity and emotional safety
- Do NOT introduce scoring or recommendations

Begin implementation now.
