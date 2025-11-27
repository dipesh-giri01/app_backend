import express from "express";

const app = express()
console.log("Hello TypeScript + Node.js!");

const PORT = 3000

app.get("/", (req, res) => {
    res.json({ message: "Hello from TypeScript Express!" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
