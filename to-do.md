# Client

## Overflow and screen size

- Auto scroll to the last message of a chat
- Start on an empty screen chat with a drawing similar to telegram or whatsapp (non chat room)
- Navigation fixed on top
- 

Project Context: Scalable Search Engine Implementation
1. Project Goal: The primary goal is to implement a high-performance, unified search engine capable of querying across three different data areas: Businesses, Events, and People. This must be a free, open-source, and self-hosted solution within the distributed SuperApp architecture.
2. Target Architecture: The core architecture uses MongoDB as the source of truth and Elasticsearch (or OpenSearch) as the dedicated search index. A separate service maintains real-time data synchronization between the two.The key services and their roles are:
- Primary Database (mongo): MongoDB Community Edition, acts as the source of truth for all data storage.
- Search Engine (elasticsearch): Elasticsearch (version 8.x), provides the Inverted Index for fast, complex queries (Full-Text, Fuzzy, Geo-spatial).
- Synchronization Worker (sync_worker): A new Node.js service that uses Mongoose and the ES Client to listen to MongoDB Change Streams and push all changes (CRUD operations) to Elasticsearch in real-time.Backend Cluster (api): The Next.js API Routes, which receive the structured client query, execute the search against Elasticsearch, and format the results for the frontend.
3. Required Implementation Tasks: The implementation is broken down into three phases:
- Phase 1: Docker Configuration (docker-compose.yml).
The existing docker-compose.yml must be updated to include the new services: Add the Elasticsearch service with the single-node configuration for simplicity and stability.Define a new sync_worker service. This service must build a Node.js image and depend on both the mongo and elasticsearch services.
- Phase 2: Synchronization Worker (sync_worker/index.js).
This dedicated Node.js service handles data synchronization.Core Logic: Connect to MongoDB and establish a Change Stream on the key collections, which include businesses, events, and users.Real-time Update: When a change event occurs, the worker must parse the document and use the Elasticsearch client to perform the corresponding index, update, or delete operation on the search index.
- Phase 3: NodeJs API Route (api/search)This is the core search logic implemented in the NodeJs API Route.Input: The route accepts a structured query that includes queryText, optional filters, and user location.
Query Construction: The route uses the Elasticsearch client to build complex queries. This includes using features like match_phrase_prefix or autocomplete for speed, the fuzzy operator for typo tolerance, and geo_distance filters for "near me" searches (relevant for events and businesses).
Output: The route must return a unified list of search results, categorized by their domain (Businesses, Events, or People).
4. Search Goals and Features: The search queries must utilize Elasticsearch's advanced features to satisfy the three domain requirements:Businesses/Products (MongoDB Collection: businesses): Needs Full-Text Search and Keyword Scoring. Priority operators include match, term, and autocomplete.Social Events (MongoDB Collection: events (not implemented yet)): Needs Geo-spatial Search and Date Range Filtering. Priority operators include geo_distance and range.People to Connect (MongoDB Collection: users): Needs Name/Profile Fuzzy Matching and Suggestion. Priority operators include fuzzy and completion.
5. Technology Stack SummaryDatabase: MongoDB Community EditionSearch Engine: Elasticsearch (OpenSearch is an acceptable alternative) Backend Framework: NoseJs (for API Routes) Messaging/Coordination: Redis (for Pub/Sub, not search) 
Key Tooling: MongoDB Change Streams, @elastic/elasticsearch client.


Search screen.                                                                         │
│                                                                                          │
│   web-app: This screen is going to be in "/search", and it will be minimalist, similar   │
│   to gemini search bar in Android.                                                       │
│                                                                                          │
│   New Service: Elastic search to support this search engine                              │
│                                                                                          │
│   Backend: This search engine will query elastic search service looking for something    │
│   similar to the words searched, for example: "I want a hamburger" this will get from    │
│   the database   