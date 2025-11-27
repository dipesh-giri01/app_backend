import express from "express";
import test from "./Test/test";

const app = express();

console.log("Hello TypeScript + Node.js!");
test();

// Middleware
app.use(express.json());

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

app.get("/api/test", (req, res) => {
    test();
    res.json({
        message: "Test function executed",
        status: "success"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        path: req.path
    });
});

export default app;
