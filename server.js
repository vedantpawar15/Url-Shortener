const express = require("express")
const cors = require("cors")

const app = express()   // ✅ FIRST create app

app.use(cors())         // ✅ THEN use it
app.get("/", (req, res) => {
    res.send("URL Shortener Running 🚀")
})
app.use(express.json())

console.log("NEW SERVER CODE RUNNING 🚀")

const urlMap = {}

function generateCode() {
    return Math.random().toString(36).substring(2, 7)
}

app.post("/shorten", (req, res) => {
    const { url } = req.body

    const shortCode = generateCode()
    urlMap[shortCode] = url

    res.json({
        shortUrl: `http://localhost:4000/${shortCode}`
    })
})

app.get("/:code", (req, res) => {
    const code = req.params.code
    const originalUrl = urlMap[code]

    if (originalUrl) {
        res.redirect(originalUrl)
    } else {
        res.send("URL not found ❌")
    }
})

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000")
})