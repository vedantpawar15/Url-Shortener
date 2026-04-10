const express = require("express")
const mongoose = require("mongoose")
const shortid = require("shortid")
const URL = require("./models/url")

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/urlShortener")
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err))

// POST - Create short URL
app.post("/shorten", async (req, res) => {
    const { originalUrl } = req.body

    if (!originalUrl) {
        return res.status(400).json({ error: "URL is required" })
    }

    const shortCode = shortid.generate()

    await URL.create({
        shortId: shortCode,
        redirectURL: originalUrl
    })

    res.json({ shortCode })
})

// GET - Redirect
app.get("/:code", async (req, res) => {
    const code = req.params.code

    const entry = await URL.findOne({ shortId: code })

    if (entry) {
        entry.clicks++
        await entry.save()

        return res.redirect(entry.redirectURL)
    } else {
        return res.status(404).send("URL not found ❌")
    }
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`)
})