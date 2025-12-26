import mongoose from "mongoose";

export async function dbConnect(): Promise<void> {
    const MONGODB_URI = process.env.MONGODB_URI || "";
    const MAX_RETRIES = 5;
    let retries = 0;

    if (!MONGODB_URI) {
        console.error("MONGO_URI environment variable is not set");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
                connectTimeoutMS: 10000, // Connection timeout
            });
            console.log("MongoDB connected successfully");
            return;
        } catch (error : any) {
            retries += 1;
            console.error(`Connection attempt ${retries} failed:`, error.message);
            if (retries === MAX_RETRIES) {
                console.error("Max retries reached. Could not connect to MongoDB.");
                process.exit(1);
            }
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
    }
}