const express = require("express");
const path = require("path");
const shortid = require("shortid");
const validator = require("validator");
require("dotenv").config();

const connectDB = require("./lib/db");
const URL = require("./models/url");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

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
  const { url, customCode } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!validator.isURL(url, { require_protocol: true })) {
    return res.status(400).json({
      error: "Invalid URL. Include protocol, e.g. https://example.com",
    });
  }

  const codePattern = /^[a-zA-Z0-9_-]{4,20}$/;
  if (customCode && !codePattern.test(customCode)) {
    return res.status(400).json({
      error:
        "Custom code must be 4-20 chars and use only letters, numbers, - or _",
    });
  }

  let shortCode = customCode || shortid.generate();

  if (customCode) {
    const existingCustom = await URL.findOne({ shortCode: customCode });
    if (existingCustom) {
      return res.status(409).json({
        error: "Custom code already taken. Try another one.",
      });
    }
  } else {
    let retries = 3;
    while (retries > 0) {
      const exists = await URL.findOne({ shortCode });
      if (!exists) break;
      shortCode = shortid.generate();
      retries -= 1;
    }
  }

  await URL.create({
    originalUrl: url,
    shortCode,
  });

  const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    shortUrl
  )}`;

  res.status(201).json({
    shortUrl,
    shortCode,
    qrCodeUrl,
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