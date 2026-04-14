const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
require("dotenv").config();

const URL = require("./models/url");

const app = express();
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch((err) => console.log(err));

// ✅ Create Short URL
app.post("/shorten", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    const shortCode = shortid.generate();

    const newUrl = new URL({
        originalUrl: url,
        shortCode: shortCode,
    });

    await newUrl.save();

    res.json({
        shortUrl: `https://localhost:5000/${shortCode}`
    });
});

// ✅ Redirect
app.get("/:code", async (req, res) => {
    const url = await URL.findOne({ shortCode: req.params.code });

    if (url) {
        res.redirect(url.originalUrl);
    } else {
        res.status(404).send("URL not found ❌");
    }
});

// ✅ PORT (IMPORTANT FOR DEPLOYMENT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});