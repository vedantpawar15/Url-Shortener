const connectDB = require("../lib/db");
const URL = require("../models/url");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  await connectDB();

  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Short code is required");
  }

  const url = await URL.findOne({ shortCode: code });

  if (!url) {
    return res.status(404).send("URL not found");
  }

  return res.redirect(url.originalUrl);
};
