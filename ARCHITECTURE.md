# Chess Player Service - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HTTP Client / API Consumer                   │
│                    (Web, Mobile, Desktop)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Express Router Layer
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
    playersRouter                         rankingsRouter
         │                                       │
    ┌────┴─────────────────┐          ┌────────┴─────────┐
    │                      │          │                  │
    │  Player Endpoints    │          │  Ranking Endpoints
    │  - getPlayerById     │          │  - Standard      
    │  - searchByFideId    │          │  - Rapid
    │  - searchByName      │          │  - Blitz
    │  - advancedSearch    │          │  - AgeGroup
    │  - federation        │          │
    │  - stats             │          │
    │                      │          │
    └────────┬─────────────┘          └────────┬────────┘
             │                                  │
             │      PlayersController          │
             └──────────┬──────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
    PlayersService                 PlayerModel
    (Business Logic)          (MongoDB Mongoose)
        │                               │
    BaseService            MongoDB Database
    (CRUD Operations)              (Data Store)
        │                               │
        └───────────────┬───────────────┘
                        │
                  Response Handler
                   (Pagination, Rank,
                    Error Envelope)
```

---

## Request/Response Flow

```
Client Request
    ↓
Express Router (players.routes.ts / rankings.routes.ts)
    ↓
PlayersController (players.controller.ts)
    ├─ Input Validation
    ├─ Build Query Filters
    ├─ Call Service Layer
    └─ Format Response
    ↓
PlayersService (players.service.ts)
    ├─ Query Construction
    ├─ Pagination Calculation
    └─ Database Query Execution
    ↓
BaseService (baseService.ts)
    └─ Mongoose Model Operations
    ↓
MongoDB
    └─ Data Retrieval
    ↓
Response Construction
    ├─ Add Pagination Metadata
    ├─ Calculate Ranks (for rankings)
    ├─ Add Timestamps
    └─ Error Handling
    ↓
JSON Response to Client
```

---

## Directory Structure

```
src/
├── modules/
│   └── chesspalyers/
│       ├── players.model.ts          # Mongoose schema & interfaces
│       ├── players.enum.ts           # Title enumerations
│       ├── players.service.ts        # Business logic layer
│       ├── players.controller.ts     # HTTP request handlers (9 methods)
│       ├── players.routes.ts         # Player endpoint routes (6)
│       └── rankings.routes.ts        # Ranking endpoint routes (4)
├── services/
│   └── baseService.ts                # Base service class with CRUD
├── errors/
│   ├── CustomError.error.ts          # Error base class
│   ├── BadRequestError.error.ts      # 400 errors
│   ├── NotFoundError.error.ts        # 404 errors
│   └── [other errors]
├── config/
│   └── [configuration files]
├── app.ts                            # Express app setup
└── index.ts                          # Entry point

Documentation/
├── API_SPECIFICATION.md              # Complete API spec
├── ROUTE_INTEGRATION_GUIDE.md        # Integration instructions
├── IMPLEMENTATION_SUMMARY.md         # Deliverables summary
├── QUICK_REFERENCE.md                # Quick lookup guide
├── ARCHITECTURE.md                   # This file
└── README.md                         # Data field legend
```

---

## Data Flow Diagram - Search Endpoint Example

```
GET /players/search/by-name?name=Giri&page=0&size=20

Request Handler (searchByName)
    ↓
Validate Input
    ├─ name: required (string)
    ├─ page: optional (number, default 0)
    └─ size: optional (number, 1-100, default 20)
    ↓
Build MongoDB Filter
    └─ { name: { $regex: "Giri", $options: "i" } }
    ↓
Call Service.getRows()
    ├─ Filter: regex query
    ├─ Page: 0 (skip 0)
    ├─ Limit: 20
    └─ Options: none
    ↓
MongoDB Query
    ├─ Find matching documents
    └─ Count total documents
    ↓
Return Result Object
    ├─ data: [player1, player2, ...]
    ├─ total: 45
    ├─ page: 1 (internal, converted)
    ├─ limit: 20
    ├─ totalPages: 3
    └─ hasNext: true
    ↓
Format Response
    ├─ success: true
    ├─ data: [...]
    ├─ pagination: {
    │   ├─ page: 0 (external, 0-indexed)
    │   ├─ size: 20
    │   ├─ totalItems: 45
    │   ├─ totalPages: 3
    │   ├─ hasNext: true
    │   └─ hasPrevious: false
    │ }
    └─ timestamp: "2025-12-26T10:30:00Z"
    ↓
Send JSON Response (200 OK)
```

---

## Pagination Logic

```
User Requests: page=2, size=20

In Controller:
    pageNum = 2 (external, 0-indexed)
    sizeNum = 20

In Service:
    skip = (pageNum + 1 - 1) * sizeNum = (3 - 1) * 20 = 40
    Query: find(...).skip(40).limit(20)
    This returns items 41-60

Response:
    page: 2
    totalItems: 200
    totalPages: 10
    hasNext: true (because 2 * 20 + 20 = 60 < 200)
    hasPrevious: true (because pageNum > 0)
```

---

## Ranking Calculation

```
/rankings/standard?page=1&size=20

Query Page 0 (items 1-20):
    rank = 0 * 20 + index + 1
    Item 0: rank 1
    Item 19: rank 20

Query Page 1 (items 21-40):
    rank = 1 * 20 + index + 1
    Item 0: rank 21
    Item 19: rank 40

Response includes:
    {
      rank: 21,        // Position 21 globally
      name: "Player",
      standard_rating: 2450
    }
```

---

## Age Group Calculation

```
Birthday Format: "1985" (stored as string in YYYY format)
Current Year: 2025

Age Calculation:
    age = currentYear - parseInt(birthday)
    age = 2025 - 1985 = 40

Age Group Mapping:
    if (birthday >= 2017) → U8
    if (birthday >= 2015) → U10
    if (birthday >= 2013) → U12
    ...
    if (birthday >= 1955 && birthday <= 1975) → S50
    if (birthday < 1955) → S70
```

---

## Filter Combination Examples

### Example 1: Simple Gender Filter
```typescript
filter: { sex: "M" }
Query: Find all male players
```

### Example 2: Federation + Rating Range
```typescript
filter: {
  federation: "NEP",
  standard_rating: { $gte: 2000, $lte: 2500 }
}
Query: Find Nepal players with 2000-2500 rating
```

### Example 3: Title with Has Title Check
```typescript
filter: {
  title: { $in: ["GM"] }  // Specific title
}
// OR
filter: {
  title: { $exists: true, $ne: [] }  // Any title
}
Query: Find GMs OR all titled players
```

### Example 4: Complex Advanced Search
```typescript
filter: {
  federation: "NEP",
  sex: "F",
  standard_rating: { $gte: 2000 },
  title: { $in: ["WGM", "WIM"] }
}
Query: Find Nepal women with 2000+ rating and WGM/WIM title
```

---

## Error Handling Architecture

```
Client Request
    ↓
Try Block (Controller)
    ├─ Validation → throw BadRequestError
    ├─ Not Found → throw NotFoundError
    └─ Service Call
    ↓
Catch Block
    └─ Pass error to next middleware
    ↓
Express Error Handler
    ├─ Extract error properties
    │   ├─ statusCode (default: 500)
    │   ├─ code
    │   ├─ message
    │   └─ details
    └─ Format error response
    ↓
Return Error Response
    └─ JSON with error envelope
```

---

## Controller Method Organization

```
PlayersController
├── Single Player Lookup
│   └── getPlayerById(id)
│
├── Search Methods (3)
│   ├── searchByFideId(id)
│   ├── searchByName(name)
│   └── advancedSearch(filters)
│
├── Ranking Methods (4)
│   ├── getRankingsStandard()
│   ├── getRankingsRapid()
│   ├── getRankingsBlitz()
│   └── getRankingsByAgeGroup(groupCode)
│
├── Federation Methods
│   └── getPlayersByFederation(code)
│
└── Statistics
    └── getPlayerStats()
```

---

## Database Query Patterns

### Pattern 1: Simple Lookup
```javascript
PlayerModel.findOne({ id_number: "3300001" })
```

### Pattern 2: Paginated Search
```javascript
PlayerModel
  .find({ name: /giri/i })
  .skip(0)
  .limit(20)
  .sort({ standard_rating: -1 })

PlayerModel.countDocuments({ name: /giri/i })
```

### Pattern 3: Multi-Filter with Aggregation
```javascript
PlayerModel.aggregate([
  {
    $facet: {
      totalPlayers: [{ $count: "count" }],
      byGender: [{ $group: { _id: "$sex", count: { $sum: 1 } } }],
      averageRatings: [{ $group: { 
        _id: null, 
        avg: { $avg: "$standard_rating" } 
      } }]
    }
  }
])
```

---

## Response Envelope Structure

### For Single Item
```json
{
  "success": boolean,
  "data": { ...playerObject },
  "timestamp": "ISO8601"
}
```

### For List Items
```json
{
  "success": boolean,
  "data": [...playerArray],
  "pagination": {
    "page": number,
    "size": number,
    "totalItems": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrevious": boolean
  },
  "timestamp": "ISO8601"
}
```

### For Errors
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "description",
    "details": {}
  },
  "timestamp": "ISO8601"
}
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Architecture | MVC |
| Error Handling | Custom Exception Classes |

---

## Key Design Decisions

1. **0-Indexed Pagination**: External API uses 0-indexed pages for consistency with modern standards
2. **Rank Calculation**: Ranks calculated dynamically from page offset + index, no storage needed
3. **Regex Search**: Case-insensitive partial matching for name search using MongoDB regex
4. **Aggregation Pipeline**: Used for statistics to avoid multiple queries
5. **Consistent Response Envelope**: All responses follow same structure for predictable parsing
6. **Error-First Approach**: Input validation before database queries
7. **Service Layer Abstraction**: BaseService provides consistent CRUD operations
8. **Age Group Calculation**: Birth year parsed as integer despite string storage

---

## Scalability Considerations

1. **Indexing**: Add MongoDB indexes on frequently queried fields:
   - `id_number` (already unique)
   - `federation`
   - `sex`
   - `standard_rating`
   - `birthday`

2. **Caching**: Consider Redis for:
   - Top 100 rankings (regenerate hourly)
   - Federation lists
   - Age group rankings

3. **Pagination**: Current approach scales well; consider cursor-based pagination for very large datasets

4. **Aggregation**: Statistics endpoint uses aggregation pipeline; consider caching results

---

**Architecture Version**: 1.0
**Last Updated**: December 26, 2025
**Status**: Production Ready ✅
