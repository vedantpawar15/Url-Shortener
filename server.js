const express = require("express")
const app = express()

console.log("NEW SERVER CODE RUNNING 🚀")

app.use(express.json())

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