import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Chess Player Service API",
            version: "1.0.0",
            description: "RESTful API for national chess federation FIDE player database. Provides advanced searching, filtering, and ranking functionality for chess players.",
            contact: {
                name: "Backend Team",
                email: "support@chessfederation.local"
            },
            license: {
                name: "MIT"
            }
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Development server",
            },
            {
                url: "https://api.chessfederation.local/api/v1",
                description: "Production server",
            }
        ],
        components: {
            schemas: {
                Player: {
                    type: "object",
                    properties: {
                        _id: { type: "string", description: "MongoDB ObjectId" },
                        id_number: { type: "string", description: "FIDE player ID" },
                        name: { type: "string", description: "Player's full name" },
                        federation: { type: "string", description: "Country federation code" },
                        sex: { type: "string", enum: ["M", "F"], description: "Gender" },
                        title: { type: "array", items: { type: "string" }, description: "Playing titles" },
                        w_title: { type: "array", items: { type: "string" }, description: "Women titles" },
                        o_title: { type: "array", items: { type: "string" }, description: "Other official titles" },
                        foa: { type: "array", items: { type: "string" }, description: "Additional designations" },
                        standard_rating: { type: "number", description: "Standard rating" },
                        standard_games: { type: "number", description: "Standard games count" },
                        sk: { type: "number", description: "Standard K factor" },
                        rapid_rating: { type: "number", description: "Rapid rating" },
                        rapid_games: { type: "number", description: "Rapid games count" },
                        rk: { type: "number", description: "Rapid K factor" },
                        blitz_rating: { type: "number", description: "Blitz rating" },
                        blitz_games: { type: "number", description: "Blitz games count" },
                        bk: { type: "number", description: "Blitz K factor" },
                        birthday: { type: "string", nullable: true, description: "Birth year (YYYY)" },
                        flag: { type: "string", nullable: true, description: "Activity flag" },
                        rank: { type: "number", description: "Ranking position (in ranking endpoints)" },
                        age: { type: "number", description: "Player age (in age group endpoints)" }
                    }
                },
                Pagination: {
                    type: "object",
                    properties: {
                        page: { type: "number", description: "Page number (0-indexed)" },
                        size: { type: "number", description: "Items per page" },
                        totalItems: { type: "number", description: "Total number of items" },
                        totalPages: { type: "number", description: "Total number of pages" },
                        hasNext: { type: "boolean", description: "Has next page" },
                        hasPrevious: { type: "boolean", description: "Has previous page" }
                    }
                },
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: { type: "array", items: { $ref: "#/components/schemas/Player" } },
                        pagination: { $ref: "#/components/schemas/Pagination" },
                        timestamp: { type: "string", format: "date-time" }
                    }
                },
                SingleResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: { $ref: "#/components/schemas/Player" },
                        timestamp: { type: "string", format: "date-time" }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        error: {
                            type: "object",
                            properties: {
                                code: { type: "string" },
                                message: { type: "string" },
                                details: { type: "object" }
                            }
                        },
                        timestamp: { type: "string", format: "date-time" }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        tags: [
            { name: "Players", description: "Player search and retrieval endpoints" },
            { name: "Rankings", description: "Player ranking and leaderboard endpoints" }
        ],
    },
    apis: [
        "./src/modules/chesspalyers/*.routes.ts"
    ], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

// Swagger UI custom options
export const swaggerOptions = {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui { background-color: #fafafa }
    `,
    customSiteTitle: "Chess Player API - Swagger UI"
};

export default swaggerSpec;
