const shortid = require("shortid");
const validator = require("validator");
const connectDB = require("../lib/db");
const URL = require("../models/url");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

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

  await URL.create({ originalUrl: url, shortCode });

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const shortUrl = `${protocol}://${host}/${shortCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    shortUrl
  )}`;

  return res.status(201).json({
    shortUrl,
    shortCode,
    qrCodeUrl,
  });
};
