const express = require("express")
const mongoose = require("mongoose")

const app = express()
app.use(express.json())

// ✅ CONNECT TO MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/urlShortener")
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err))

// ✅ SCHEMA (WITH CLICKS + EXPIRY)
const urlSchema = new mongoose.Schema({
    originalUrl: String,

    shortCode: {
        type: String,
        unique: true
    },

    expiresAt: {
        type: Date
    },

    // ✅ CLICK TRACKING ARRAY
    clicks: [
        {
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

const Url = mongoose.model("Url", urlSchema)


// =====================================================
// ✅ CREATE SHORT URL (CUSTOM + EXPIRY)
// =====================================================
app.post("/shorten", async (req, res) => {
    try {
        const { originalUrl, customCode } = req.body

        let shortCode = customCode

        // 🔹 If user doesn't provide custom code → generate random
        if (!shortCode) {
            shortCode = Math.random().toString(36).substring(2, 8)
        }

        // 🔹 Check if code already exists
        const existing = await Url.findOne({ shortCode })
        if (existing) {
            return res.json({ error: "Custom code already taken ❌" })
        }

        // 🔹 Expiry (1 min for testing)
        const expiry = new Date(Date.now() + 60 * 1000)

        const newUrl = new Url({
            originalUrl,
            shortCode,
            expiresAt: expiry
        })

        await newUrl.save()

        res.json({
            shortUrl: `http://localhost:3000/${shortCode}`,
            expiresAt: expiry
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Something went wrong" })
    }
})


// =====================================================
// ✅ REDIRECT + CLICK TRACKING
// =====================================================
app.get("/:code", async (req, res) => {
    try {
        const url = await Url.findOne({ shortCode: req.params.code })

        if (!url) {
            return res.send("URL not found ❌")
        }

        // 🔹 Check expiry
        if (url.expiresAt && url.expiresAt < new Date()) {
            return res.send("Link expired ⌛")
        }

        // 🔥 TRACK CLICK (IMPORTANT)
        url.clicks.push({})   // adds timestamp automatically
        await url.save()

        res.redirect(url.originalUrl)

    } catch (err) {
        console.log(err)
        res.status(500).send("Server error")
    }
})


// =====================================================
// ✅ ANALYTICS API
// =====================================================
app.get("/analytics/:code", async (req, res) => {
    try {
        const url = await Url.findOne({ shortCode: req.params.code })

        if (!url) {
            return res.send("URL not found ❌")
        }

        res.json({
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            totalClicks: url.clicks.length,
            clicks: url.clicks   // 👈 THIS SHOULD SHOW TIMESTAMPS
        })

    } catch (err) {
        console.log(err)
        res.status(500).send("Server error")
    }
})


// =====================================================
// ✅ START SERVER
// =====================================================
app.listen(3000, () => {
    console.log("Server running on port 3000 🚀")
})