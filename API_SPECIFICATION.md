# Player Service API Specification
## National Chess Federation - FIDE Player Database API

### Document Version: 1.0
**Last Updated:** December 26, 2025

---

## 1. Overview

This API provides access to chess player data from the national chess federation's FIDE player database. It supports searching, filtering, and ranking players based on ratings, age groups, and other demographics.

### Base URL
```
http://localhost:3000/api/v1
```

### API Response Envelope
All list endpoints return data wrapped in a consistent pagination envelope:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 95,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

---

## 2. Core Model Reference

**Player Entity Fields:**
```typescript
{
  id_number: string;           // FIDE ID (unique identifier)
  name: string;                // Player's full name
  federation: string;          // Country federation code (e.g., NEP)
  sex: string;                 // 'M' for Male, 'F' for Female
  title: string[];             // Playing titles (GM, IM, FM, CM, etc.)
  w_title: string[];           // Women-specific titles (WGM, WIM, etc.)
  o_title: string[];           // Other official titles (IA, FA, etc.)
  foa: string[];               // Additional designations
  standard_rating: number;     // Standard rating
  standard_games: number;      // Number of standard games
  sk: number;                  // Standard K factor
  rapid_rating: number;        // Rapid rating
  rapid_games: number;         // Number of rapid games
  rk: number;                  // Rapid K factor
  blitz_rating: number;        // Blitz rating
  blitz_games: number;         // Number of blitz games
  bk: number;                  // Blitz K factor
  birthday: string | null;     // Year of birth (YYYY format)
  flag: string | null;         // Activity flag (I=inactive, WI=woman inactive, w=woman)
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  }
}
```

---

## 3. Endpoint Specifications

### 3.1 GET /players/{id_number}
**Description:** Retrieve a single player's complete details by FIDE ID.

**Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| id_number | string | Yes | Player's FIDE ID (path parameter) | `3300001` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "id_number": "3300001",
    "name": "Sample Player",
    "federation": "NEP",
    "sex": "M",
    "title": ["GM"],
    "w_title": [],
    "o_title": ["IA"],
    "foa": [],
    "standard_rating": 2450,
    "standard_games": 150,
    "sk": 16,
    "rapid_rating": 2300,
    "rapid_games": 80,
    "rk": 16,
    "blitz_rating": 2100,
    "blitz_games": 200,
    "bk": 32,
    "birthday": "1985",
    "flag": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-12-26T10:30:00Z"
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 404 | PLAYER_NOT_FOUND | Player with ID {id_number} not found | FIDE ID does not exist in database |
| 400 | INVALID_PLAYER_ID | Invalid player ID format | ID format is invalid |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.2 GET /players/search/by-fide-id
**Description:** Search for a player by their FIDE ID with exact match.

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| id_number | string | Yes | FIDE player ID | `3300001` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "id_number": "3300001",
    "name": "Sample Player",
    "federation": "NEP",
    "sex": "M",
    "title": ["GM"],
    "w_title": [],
    "o_title": ["IA"],
    "foa": [],
    "standard_rating": 2450,
    "standard_games": 150,
    "sk": 16,
    "rapid_rating": 2300,
    "rapid_games": 80,
    "rk": 16,
    "blitz_rating": 2100,
    "blitz_games": 200,
    "bk": 32,
    "birthday": "1985",
    "flag": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2025-12-26T10:30:00Z"
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 404 | PLAYER_NOT_FOUND | No player found with FIDE ID {id_number} | ID does not exist |
| 400 | INVALID_FIDE_ID | FIDE ID is required | Missing query parameter |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.3 GET /players/search/by-name
**Description:** Search players by name (case-insensitive partial match).

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| name | string | Yes | Player's full name or partial name | `Giri` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id_number": "3300001",
      "name": "Anish Giri",
      "federation": "NEP",
      "sex": "M",
      "title": ["GM"],
      "w_title": [],
      "o_title": [],
      "foa": [],
      "standard_rating": 2450,
      "standard_games": 150,
      "sk": 16,
      "rapid_rating": 2300,
      "rapid_games": 80,
      "rk": 16,
      "blitz_rating": 2100,
      "blitz_games": 200,
      "bk": 32,
      "birthday": "1985",
      "flag": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 400 | INVALID_QUERY | Search name is required | Missing name parameter |
| 400 | INVALID_PAGINATION | Page must be >= 0, size must be between 1-100 | Invalid page/size |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.4 GET /players/search/advanced
**Description:** Advanced search with multiple filters (federation, gender, title, rating range).

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| federation | string | No | Country federation code | `NEP` |
| sex | string | No | 'M' for Male, 'F' for Female | `M` |
| title | string | No | Playing title (GM, IM, FM, etc.) | `GM` |
| minRating | number | No | Minimum standard rating | `2000` |
| maxRating | number | No | Maximum standard rating | `2500` |
| hasTitle | boolean | No | Filter players with any title | `true` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Query Example:**
```
GET /players/search/advanced?federation=NEP&sex=M&minRating=2000&page=0&size=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id_number": "3300001",
      "name": "Player Name",
      "federation": "NEP",
      "sex": "M",
      "title": ["GM"],
      "w_title": [],
      "o_title": [],
      "foa": [],
      "standard_rating": 2450,
      "standard_games": 150,
      "sk": 16,
      "rapid_rating": 2300,
      "rapid_games": 80,
      "rk": 16,
      "blitz_rating": 2100,
      "blitz_games": 200,
      "bk": 32,
      "birthday": "1985",
      "flag": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 400 | INVALID_QUERY | Invalid query parameters | Malformed filter values |
| 400 | INVALID_PAGINATION | Page must be >= 0, size must be between 1-100 | Invalid pagination |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.5 GET /rankings/standard
**Description:** Get top-ranked players by standard rating (global rankings).

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| gender | string | No | 'M' or 'F' for gender filter | `M` |
| federation | string | No | Country federation code | `NEP` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id_number": "3300001",
      "name": "Top Ranked Player",
      "federation": "NEP",
      "sex": "M",
      "title": ["GM"],
      "standard_rating": 2700,
      "standard_games": 150,
      "sk": 16,
      "rank": 1
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "id_number": "3300002",
      "name": "Second Ranked Player",
      "federation": "NEP",
      "sex": "M",
      "title": ["GM"],
      "standard_rating": 2680,
      "standard_games": 140,
      "sk": 16,
      "rank": 2
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 400 | INVALID_PAGINATION | Page must be >= 0, size must be between 1-100 | Invalid pagination |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.6 GET /rankings/rapid
**Description:** Get top-ranked players by rapid rating.

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| gender | string | No | 'M' or 'F' for gender filter | `F` |
| federation | string | No | Country federation code | `NEP` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response:** Same structure as `/rankings/standard` but sorted by `rapid_rating`.

---

### 3.7 GET /rankings/blitz
**Description:** Get top-ranked players by blitz rating.

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| gender | string | No | 'M' or 'F' for gender filter | `M` |
| federation | string | No | Country federation code | `NEP` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response:** Same structure as `/rankings/standard` but sorted by `blitz_rating`.

---

### 3.8 GET /rankings/age-group/{groupCode}
**Description:** Get ranked players within a specific age group.

**Age Group Codes:**
| Code | Category |
|------|----------|
| `U8` | Under 8 |
| `U10` | Under 10 |
| `U12` | Under 12 |
| `U14` | Under 14 |
| `U16` | Under 16 |
| `U18` | Under 18 |
| `S20` | Seniors 20-39 |
| `S40` | Seniors 40-49 |
| `S50` | Seniors 50-59 |
| `S60` | Seniors 60-69 |
| `S70` | Seniors 70+ |

**Path Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| groupCode | string | Yes | Age group code | `U18` |

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| gender | string | No | 'M' or 'F' for gender filter | `F` |
| ratingType | string | No | 'standard', 'rapid', 'blitz' (default: standard) | `standard` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id_number": "3300001",
      "name": "Young Talent",
      "federation": "NEP",
      "sex": "F",
      "title": ["CM"],
      "standard_rating": 1850,
      "standard_games": 80,
      "sk": 20,
      "birthday": "2010",
      "rank": 1,
      "age": 15
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  },
  "groupCode": "U18",
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 400 | INVALID_AGE_GROUP | Invalid age group code. Allowed: U8, U10, U12, U14, U16, U18, S20, S40, S50, S60, S70 | Invalid groupCode |
| 400 | INVALID_PAGINATION | Page must be >= 0, size must be between 1-100 | Invalid pagination |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

### 3.9 GET /players/federation/{federation}
**Description:** Get all players from a specific federation.

**Path Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| federation | string | Yes | Country federation code | `NEP` |

**Query Parameters:**
| Name | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| sortBy | string | No | 'standard', 'rapid', 'blitz' (default: standard) | `standard` |
| gender | string | No | 'M' or 'F' for gender filter | `M` |
| page | number | No | Page number (0-indexed) | `0` |
| size | number | No | Results per page (default: 20, max: 100) | `20` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id_number": "3300001",
      "name": "Player Name",
      "federation": "NEP",
      "sex": "M",
      "title": ["GM"],
      "standard_rating": 2450,
      "standard_games": 150,
      "sk": 16
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "federation": "NEP",
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Error Responses:**
| Status | Error Code | Message | Cause |
|--------|-----------|---------|-------|
| 400 | INVALID_FEDERATION | Federation code is required | Missing federation parameter |
| 400 | INVALID_PAGINATION | Page must be >= 0, size must be between 1-100 | Invalid pagination |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred | Server error |

---

## 4. Common Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters, validation errors |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

---

## 5. Pagination Details

All list endpoints support the following pagination parameters:
- **page** (number, default: 0): 0-indexed page number
- **size** (number, default: 20, max: 100): Number of items per page

**Pagination Response Structure:**
```json
{
  "page": 0,
  "size": 20,
  "totalItems": 95,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

---

## 6. Error Response Format

All error responses follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

**Example Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PLAYER_NOT_FOUND",
    "message": "Player with ID 3300001 not found",
    "details": {
      "id_number": "3300001"
    }
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

---

## 7. Rate Limiting & Authentication (Future)

This specification currently does not include authentication or rate limiting. These features should be added in future versions.

---

## 8. API Usage Examples

### Example 1: Search player by name
```bash
curl -X GET "http://localhost:3000/api/v1/players/search/by-name?name=Giri&page=0&size=10"
```

### Example 2: Get top 20 standard rating players
```bash
curl -X GET "http://localhost:3000/api/v1/rankings/standard?page=0&size=20"
```

### Example 3: Get women's Under-18 rankings
```bash
curl -X GET "http://localhost:3000/api/v1/rankings/age-group/U18?gender=F&ratingType=standard&page=0&size=20"
```

### Example 4: Advanced search - Nepali GMs
```bash
curl -X GET "http://localhost:3000/api/v1/players/search/advanced?federation=NEP&title=GM&minRating=2500&page=0&size=20"
```

---

## 9. Data Validation Rules

- **id_number**: Non-empty string, unique, typically numeric
- **name**: Non-empty string, max 255 characters
- **federation**: Valid FIDE federation code (2-3 characters)
- **sex**: Must be 'M' or 'F'
- **birthday**: Year format (YYYY), between 1900 and current year
- **Ratings**: Numbers between 0 and 4000
- **Page**: Non-negative integer
- **Size**: Integer between 1 and 100

---

## 10. Future Enhancements

1. Add player statistics endpoint (win rate, performance ratings)
2. Add historical rating trends
3. Add tournament/event data filtering
4. Add authentication and authorization
5. Add rate limiting
6. Add caching for frequently accessed data
7. Add export functionality (CSV, JSON)
8. Add advanced filters (opponents, tournament results)

---
