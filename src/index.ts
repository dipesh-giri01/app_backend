import dotenv from "dotenv";
import app from "./app.js";
import { dbConnect } from "./config/dbConnect/dbConnect.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server with database connection
async function startServer() {
    try {
        // Connect to MongoDB
        await dbConnect();
        
        // Only listen on port in development (not on Vercel)
        if (process.env.VERCEL !== '1') {
            app.listen(PORT, () => {
                console.log(`Server running at http://localhost:${PORT}`);
            });
        }
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();