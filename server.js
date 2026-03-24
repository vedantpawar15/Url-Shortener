const fs = require("fs")
const express = require("express")
const cors = require("cors")

function readData() {
    const data = fs.readFileSync("data.json")
    return JSON.parse(data)
}

function writeData(data) {
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2))
}

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
    const { originalUrl } = req.body

    const code = Math.random().toString(36).substring(2, 8)

    const data = readData()       // read file
    data[code] = originalUrl      // add new entry
    writeData(data)               // save file

    res.json({ shortUrl: `http://localhost:4000/${code}` })
})

app.get("/:code", (req, res) => {
    const code = req.params.code

    const data = readData()
    console.log("Code:", code)
    console.log("Data:", data)

    const originalUrl = data[code]

    if (originalUrl) {
        console.log("Redirecting to:", originalUrl)
        res.redirect(originalUrl)
    } else {
        res.send("URL not found ❌")
    }
})

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000")
})