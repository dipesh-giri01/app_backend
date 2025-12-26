# Chess Player API - Quick Reference

## 🚀 Quick Start

### 1. Integrate Routes
```typescript
// src/app.ts
import playersRouter from "./modules/chesspalyers/players.routes";
import rankingsRouter from "./modules/chesspalyers/rankings.routes";

app.use("/api/v1/players", playersRouter);
app.use("/api/v1/rankings", rankingsRouter);
```

### 2. Test an Endpoint
```bash
curl "http://localhost:3000/api/v1/rankings/standard?gender=M&page=0&size=20"
```

---

## 📋 All Endpoints

### Player Endpoints (6)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/players/{id_number}` | GET | Get player by ID |
| `/players/search/by-fide-id?id_number=123` | GET | Search by FIDE ID |
| `/players/search/by-name?name=Giri` | GET | Search by name |
| `/players/search/advanced?...` | GET | Advanced search |
| `/players/federation/{code}` | GET | Get federation players |
| `/players/stats` | GET | Database stats |

### Ranking Endpoints (4)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rankings/standard` | GET | Standard rating rankings |
| `/rankings/rapid` | GET | Rapid rating rankings |
| `/rankings/blitz` | GET | Blitz rating rankings |
| `/rankings/age-group/{code}` | GET | Age group rankings |

---

## 🔍 Common Queries

### Get top 20 standard players (men)
```bash
GET /rankings/standard?gender=M&page=0&size=20
```

### Get women's under-18 players
```bash
GET /rankings/age-group/U18?gender=F&ratingType=standard
```

### Search player by name
```bash
GET /players/search/by-name?name=Giri&page=0&size=10
```

### Find Nepali GMs with 2500+ rating
```bash
GET /players/search/advanced?federation=NEP&title=GM&minRating=2500
```

### Get all Nepal players
```bash
GET /players/federation/NEP?sortBy=standard&page=0&size=20
```

### Get player stats
```bash
GET /players/stats
```

---

## 📊 Age Group Codes

| Code | Age Range |
|------|-----------|
| U8 | Under 8 |
| U10 | Under 10 |
| U12 | Under 12 |
| U14 | Under 14 |
| U16 | Under 16 |
| U18 | Under 18 |
| S20 | 20-39 years |
| S40 | 40-49 years |
| S50 | 50-59 years |
| S60 | 60-69 years |
| S70 | 70+ years |

---

## 🏷️ Title Codes

### Playing Titles
- `GM` - Grand Master
- `WGM` - Woman Grand Master
- `IM` - International Master
- `WIM` - Woman International Master
- `FM` - FIDE Master
- `WFM` - Woman FIDE Master
- `CM` - Candidate Master
- `WCM` - Woman Candidate Master

### Official Titles
- `IA` - International Arbiter
- `FA` - FIDE Arbiter
- `NA` - National Arbiter
- `FST` - FIDE Senior Trainer
- `FT` - FIDE Trainer

---

## ⚙️ Query Parameters

### Universal Pagination
- `page=0` (default) - Page number (0-indexed)
- `size=20` (default) - Items per page (1-100)

### Filter Parameters
- `gender` - 'M' or 'F'
- `federation` - Country code (e.g., NEP)
- `title` - Title abbreviation
- `minRating` - Minimum rating
- `maxRating` - Maximum rating
- `hasTitle` - true/false
- `sortBy` - 'standard', 'rapid', 'blitz'
- `ratingType` - 'standard', 'rapid', 'blitz'

---

## ✅ Response Format

### Success (Single Item)
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

### Success (List)
```json
{
  "success": true,
  "data": [ ... ],
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

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description",
    "details": { }
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

---

## 📂 File Reference

| File | Purpose |
|------|---------|
| `API_SPECIFICATION.md` | Complete API documentation |
| `ROUTE_INTEGRATION_GUIDE.md` | Integration instructions |
| `IMPLEMENTATION_SUMMARY.md` | What was built |
| `players.controller.ts` | Endpoint implementations |
| `players.routes.ts` | Player routes |
| `rankings.routes.ts` | Ranking routes |
| `players.service.ts` | Business logic |
| `players.model.ts` | Data model |

---

## 🎯 Key Features

✅ **9 endpoints** covering search, rankings, and federation queries
✅ **Advanced filtering** by rating, gender, title, federation
✅ **Pagination** with consistent envelope (page, size, totalItems, etc.)
✅ **Age group rankings** with 11 categories (U8-U18, S20-S70)
✅ **Rank calculation** for all ranking endpoints
✅ **Database stats** endpoint with aggregated data
✅ **Error handling** with custom exception codes
✅ **Case-insensitive** name searching
✅ **Automatic age calculation** from birth year

---

## 🔗 Usage Examples

### Node.js/Fetch
```javascript
// Get top 20 standard players
const response = await fetch(
  'http://localhost:3000/api/v1/rankings/standard?page=0&size=20'
);
const data = await response.json();
console.log(data.data); // Array of players
```

### cURL
```bash
curl -X GET \
  "http://localhost:3000/api/v1/players/search/by-name?name=Giri&page=0&size=10" \
  -H "Content-Type: application/json"
```

### Postman
1. Create new GET request
2. URL: `http://localhost:3000/api/v1/rankings/standard`
3. Add query params: `gender=M`, `page=0`, `size=20`
4. Send

---

## 🐛 Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| PLAYER_NOT_FOUND | 404 | No player found |
| INVALID_QUERY | 400 | Bad parameters |
| INVALID_PAGINATION | 400 | Invalid page/size |
| INVALID_AGE_GROUP | 400 | Invalid age code |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## 📚 Documentation Files

1. **API_SPECIFICATION.md** - Full 10-section API spec
2. **ROUTE_INTEGRATION_GUIDE.md** - Setup & integration
3. **IMPLEMENTATION_SUMMARY.md** - What was delivered
4. **README.md** - Data field legend
5. **QUICK_REFERENCE.md** - This file!

---

**Last Updated**: December 26, 2025
**Version**: 1.0
**Status**: Production Ready ✅
