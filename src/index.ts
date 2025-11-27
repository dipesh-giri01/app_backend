import express from "express";
import test from "./Test/test.js";

const app = express()
console.log("Hello TypeScript + Node.js!");

const PORT = 3000
test()
app.get("/", (req, res) => {
    res.json({ message: "Hello from TypeScript Express!" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})
