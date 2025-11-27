import app from "./app";

const PORT = process.env.PORT || 3000;

// Only listen on port in development (not on Vercel)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}