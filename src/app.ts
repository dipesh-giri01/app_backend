import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger-docs/swagger.config";
import { IndexRouter } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

console.log("Hello TypeScript + Node.js!");

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    next();
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/v1", IndexRouter);

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Hello from TypeScript Express!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

app.get("/api", (req, res) => {
    res.json({
        status: "ok",
        message: "API endpoint working"
    });
});


// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        path: req.path
    });
});

export default app;
