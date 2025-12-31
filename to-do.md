Solar Grid: Distributed Node Specification

1. Concept Overview

The Solar Grid is a decentralized infrastructure layer for the SolarApp Nexus. It allows community members (Volunteers) to contribute their idle computing resources (CPU, RAM, and Bandwidth) to the network. In exchange for processing application tasks, users earn Lumens (ln), the primary energy unit of the Solarpunk economy.

2. Technical Architecture

A. The Relay Client (relay.js)

A lightweight, headless Node.js application running on the user's local machine.

Tunnelling: Uses localtunnel to create a public URL (e.g., https://active-node-99.loca.lt) without requiring port forwarding.

Connection: Establishes a persistent WebSocket connection to the central API cluster.

Authentication: Authenticates via a unique NodeKey linked to the user's userId.

B. The Central Grid Controller

A service running within the main Docker cluster that manages the volunteer pool.

Node Registry: A Redis-backed list of active nodeUrls and their current latency/health status.

Task Dispatcher: A load-balancing logic that selects an available volunteer node to handle specific "Read-Only" or "Data-Processing" tasks.

3. Reward Mechanism: Proof of Contribution (PoC)

Instead of energy-intensive mining, the Solar Grid uses a task-based reward system.

Assignment: The Grid Controller sends a TASK_REQUEST (e.g., "Filter this business list" or "Generate search thumbnails").

Execution: The local node processes the data.

Receipt: The node returns the TASK_RESULT along with metadata (processing time, CPU cycles).

Verification: The Central API verifies the result.

Minting: Upon successful verification, the backend executes a MongoDB transaction:

db.users.updateOne(
  { _id: userId },
  { $inc: { "battery.lumens": 0.5 } } // Reward per task
);


4. Database & Security Protocol

Data Isolation (Crucial)

Volunteer nodes NEVER have direct access to the production MongoDB or Redis instances.

Read Logic: Nodes receive the raw data they need to process within the WebSocket payload itself, or they fetch public data from a restricted CDN.

Write Logic: Nodes have zero write permissions. All state changes (like balance updates) are performed by the central server after validating the node's work.

Consensus Verification

To prevent "Cheating" (nodes sending fake results to claim Lumens), the Grid Controller employs Consensus Check:

High-priority tasks are sent to two different nodes simultaneously.

If results match, both are rewarded.

If results differ, the task is sent to a third "Authority Node" (central server), and the malicious/faulty node is flagged.

5. User Experience (The Solarpunk UI)

The "Solar Grid" tab in the SuperApp provides:

Node Status: Real-time visualization of the local "Pulse."

Harvest Stats: A live counter of Lumens earned during the current session.

Impact Meter: Shows how much the user has helped the Uruguayan community by reducing central server load.

6. Implementation Roadmap

Phase 1: Develop the relay.js client with localtunnel integration.

Phase 2: Implement the Socket.io register_node logic in the main backend.

Phase 3: Create the "Consensus Engine" for task validation.

Phase 4: Release the "One-Click Join" UI in the Next.js dashboard.
