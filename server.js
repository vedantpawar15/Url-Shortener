const express = require("express");
const shortid = require("shortid");
const validator = require("validator");
require("dotenv").config();

const connectDB = require("./lib/db");
const URL = require("./models/url");

const app = express();
app.use(express.json());

connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch(() => {
    console.error(
      "MongoDB auth failed. Check MONGO_URI username/password and Atlas IP access list."
    );
    process.exit(1);
  });

// ✅ Create Short URL
app.post("/shorten", async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(400).json({
      error: "Invalid URL. Include protocol, e.g. https://example.com",
    });
  }

  const shortCode = shortid.generate();
  const newUrl = new URL({
    originalUrl: url,
    shortCode,
  });
  await newUrl.save();

  res.status(201).json({
    shortUrl: `${req.protocol}://${req.get("host")}/${shortCode}`,
    shortCode,
  });
});

// ✅ Redirect
app.get("/:code", async (req, res) => {
  const url = await URL.findOne({ shortCode: req.params.code });

  if (url) {
    return res.redirect(url.originalUrl);
  }

  return res.status(404).send("URL not found");
});

// ✅ PORT (IMPORTANT FOR DEPLOYMENT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});