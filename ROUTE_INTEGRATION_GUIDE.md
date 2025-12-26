# Players Module - Route Integration Guide

This document explains how to integrate the Players module routes into your main Express application.

## File Structure

```
src/modules/chesspalyers/
├── players.model.ts          # Mongoose model and interface
├── players.enum.ts           # Enum for player titles
├── players.service.ts        # Service layer for business logic
├── players.controller.ts     # Controllers handling HTTP requests
├── players.routes.ts         # Routes for /players endpoints
├── rankings.routes.ts        # Routes for /rankings endpoints
```

## Integration Steps

### Step 1: Update your main app.ts or index.ts

```typescript
import express from "express";
import playersRouter from "./modules/chesspalyers/players.routes";
import rankingsRouter from "./modules/chesspalyers/rankings.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/players", playersRouter);
app.use("/api/v1/rankings", rankingsRouter);

// Error handling middleware (should be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(status).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_SERVER_ERROR",
            message,
            details: err.details || {}
        },
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

## Available Endpoints

### Players Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/players/:id_number` | Get player by FIDE ID |
| GET | `/api/v1/players/search/by-fide-id?id_number=...` | Search by FIDE ID |
| GET | `/api/v1/players/search/by-name?name=...&page=0&size=20` | Search by name |
| GET | `/api/v1/players/search/advanced?...` | Advanced search with filters |
| GET | `/api/v1/players/federation/:federation?sortBy=standard&page=0&size=20` | Get players by federation |
| GET | `/api/v1/players/stats` | Get database statistics |

### Rankings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rankings/standard?gender=M&page=0&size=20` | Standard rating rankings |
| GET | `/api/v1/rankings/rapid?gender=F&page=0&size=20` | Rapid rating rankings |
| GET | `/api/v1/rankings/blitz?gender=M&page=0&size=20` | Blitz rating rankings |
| GET | `/api/v1/rankings/age-group/U18?gender=F&ratingType=standard&page=0&size=20` | Age group rankings |

## Query Parameters Reference

### Pagination Parameters (all list endpoints)
- `page` (number, default: 0): Zero-indexed page number
- `size` (number, default: 20, max: 100): Items per page

### Filter Parameters

#### Search by Name
- `name` (string, required): Player name or partial name

#### Advanced Search
- `federation` (string): Country code (e.g., NEP)
- `sex` (string): 'M' or 'F'
- `title` (string): Title abbreviation (GM, IM, FM, etc.)
- `minRating` (number): Minimum standard rating
- `maxRating` (number): Maximum standard rating
- `hasTitle` (boolean): Filter players with titles

#### Rankings Filters
- `gender` (string): 'M' or 'F'
- `federation` (string): Country code
- `ratingType` (string): 'standard', 'rapid', or 'blitz' (for age groups)
- `sortBy` (string): 'standard', 'rapid', or 'blitz' (for federation endpoint)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2025-12-26T10:30:00Z"
}
```

## Examples

### Get a single player by FIDE ID
```bash
curl -X GET "http://localhost:3000/api/v1/players/3300001"
```

### Search players by name
```bash
curl -X GET "http://localhost:3000/api/v1/players/search/by-name?name=Giri&page=0&size=10"
```

### Get Top 20 standard rating players (Men only)
```bash
curl -X GET "http://localhost:3000/api/v1/rankings/standard?gender=M&page=0&size=20"
```

### Get Women's Under-18 rankings
```bash
curl -X GET "http://localhost:3000/api/v1/rankings/age-group/U18?gender=F&ratingType=standard&page=0&size=20"
```

### Advanced search - Nepali GMs with rating >= 2500
```bash
curl -X GET "http://localhost:3000/api/v1/players/search/advanced?federation=NEP&title=GM&minRating=2500&page=0&size=20"
```

### Get all players from Nepal
```bash
curl -X GET "http://localhost:3000/api/v1/players/federation/NEP?sortBy=standard&page=0&size=20"
```

### Get database statistics
```bash
curl -X GET "http://localhost:3000/api/v1/players/stats"
```

## Age Group Codes

| Code | Description |
|------|-------------|
| U8 | Under 8 years |
| U10 | Under 10 years |
| U12 | Under 12 years |
| U14 | Under 14 years |
| U16 | Under 16 years |
| U18 | Under 18 years |
| S20 | Seniors 20-39 years |
| S40 | Seniors 40-49 years |
| S50 | Seniors 50-59 years |
| S60 | Seniors 60-69 years |
| S70 | Seniors 70+ years |

## Title Abbreviations

### Playing Titles
- GM - Grand Master
- WGM - Woman Grand Master
- IM - International Master
- WIM - Woman International Master
- FM - FIDE Master
- WFM - Woman FIDE Master
- NM - National Master
- CM - Candidate Master
- WCM - Woman Candidate Master
- WNM - Woman National Master
- LM - Life Master
- BOT - Bot/Computer

### Official Titles
- IA - International Arbiter
- FA - FIDE Arbiter
- NA - National Arbiter
- FST - FIDE Senior Trainer
- FT - FIDE Trainer
- SI - FIDE Instructor
- NI - National Instructor
- DI - Developmental Instructor

## Implementation Notes

1. **Error Handling**: The controller methods throw custom errors (`BadRequestError`, `NotFoundError`) which should be caught by Express error handling middleware.

2. **Pagination**: All list endpoints support pagination with `page` (0-indexed) and `size` parameters. Default page size is 20, maximum is 100.

3. **Sorting**: Rankings endpoints automatically sort by the relevant rating field in descending order. Each result includes a `rank` field calculated based on position.

4. **Age Calculation**: For age group rankings, age is calculated from the current year minus birth year stored in the database.

5. **Case Insensitivity**: Name searches are case-insensitive for better user experience.

6. **Rating Validation**: Rating filters (minRating, maxRating) must be valid numbers between 0-4000.

## Future Enhancements

1. Add caching for frequently accessed rankings
2. Add authentication/authorization
3. Add rate limiting
4. Add export functionality (CSV, Excel)
5. Add historical data endpoints
6. Add tournament/event filtering
7. Add player performance statistics
8. Add comparison endpoints between players

---

For complete API specification, see [API_SPECIFICATION.md](../../../API_SPECIFICATION.md)
