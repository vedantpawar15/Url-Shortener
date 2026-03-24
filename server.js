const express = require("express")
const mongoose = require("mongoose")

const app = express()
app.use(express.json())

// 🔌 MongoDB Connection
mongoose.connect("mongodb+srv://Vedant:vedant123@url-shortener-cluster.5uds6cb.mongodb.net/urlShortener?retryWrites=true&w=majority")
.then(() => {
    console.log("MongoDB connected ✅")
})
.catch(err => {
    console.log("MongoDB connection error ❌")
    console.log(err)
})
// 📦 Schema + Model
const urlSchema = new mongoose.Schema({
    shortCode: String,
    originalUrl: String,
    clicks: {
        type: Number,
        default: 0
    }
})

const Url = mongoose.model("Url", urlSchema)

// 🧪 Test route
app.get("/test", (req, res) => {
    res.send("Server working ✅")
})

// 🔗 POST → Create short URL
app.post("/shorten", async (req, res) => {
    try {
        let { originalUrl } = req.body

        if (!originalUrl) {
            return res.send("URL is required ❌")
        }

        if (!originalUrl.startsWith("http")) {
            originalUrl = "https://" + originalUrl
        }

        const code = Math.random().toString(36).substring(2, 8)

        console.log("Saving:", code, originalUrl)

        const newUrl = new Url({
            shortCode: code,
            originalUrl: originalUrl
        })

        await newUrl.save()

        console.log("Saved to MongoDB ✅")

        res.json({ shortUrl: `http://localhost:4000/${code}` })

    } catch (err) {
        console.log("Error:", err)
        res.status(500).send("Server Error ❌")
    }
})

// 🔁 GET → Redirect
app.get("/:code", async (req, res) => {
    try {
        const code = req.params.code

        const url = await Url.findOne({ shortCode: code })

        if (url) {
            url.clicks += 1
            await url.save()

            console.log("Clicks:", url.clicks)

            res.redirect(url.originalUrl)
        } else {
            res.send("URL not found ❌")
        }

    } catch (err) {
        console.log(err)
        res.status(500).send("Server Error ❌")
    }
})

// 🚀 Start server
app.listen(4000, () => {
    console.log("NEW SERVER CODE RUNNING 🚀")
    console.log("Server running on http://localhost:4000")
})