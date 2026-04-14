const shortid = require("shortid");
const validator = require("validator");
const connectDB = require("../lib/db");
const URL = require("../models/url");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

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
  const newUrl = new URL({ originalUrl: url, shortCode });
  await newUrl.save();

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;

  return res.status(201).json({
    shortUrl: `${protocol}://${host}/${shortCode}`,
    shortCode,
  });
};
