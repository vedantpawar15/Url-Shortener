# URL Shortener (LinkForge)

A full-stack URL shortener and QR generator with a modern React-based frontend, Express/MongoDB backend, and Vercel-ready serverless API routes.

## Features

- Shorten long URLs into compact shareable links
- Optional custom short codes (`4-20` chars, `a-z`, `A-Z`, `0-9`, `_`, `-`)
- Input validation with protocol enforcement (`http://` or `https://`)
- Instant redirect from short code to original URL
- QR code generation in PNG and SVG formats
- Works locally (`Express`) and in production (`Vercel rewrites + API routes`)

## Tech Stack

- **Frontend:** React 18 (UMD), Babel Standalone, Three.js
- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Validation / Utility:** validator, shortid
- **Deployment:** Vercel

## Project Structure

```text
url-shortener/
|- api/
|  |- shorten.js      # Serverless endpoint to create short links
|  |- redirect.js     # Serverless redirect handler
|- lib/
|  |- db.js           # MongoDB connection with caching
|- models/
|  |- url.js          # URL schema/model
|- index.html         # Single-page frontend app
|- server.js          # Local Express server
|- vercel.json        # Vercel rewrites
|- package.json
|- .env               # Local environment variables (not for commit)
```

## Setup and Run (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create/update `.env`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3) Start server

```bash
npm run dev
```

Server starts on `http://localhost:5000`.

## API Endpoints

### `POST /shorten`

Create a short URL.

**Request body**

```json
{
  "url": "https://example.com/very/long/path",
  "customCode": "my-code-123"
}
```

**Success (`201`)**

```json
{
  "shortUrl": "http://localhost:5000/my-code-123",
  "shortCode": "my-code-123",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=..."
}
```

### `GET /:code`

Redirects the user to the original URL.

- `302` redirect if short code exists
- `404` if short code does not exist

## Deployment Notes (Vercel)

- `vercel.json` rewrites:
  - `/` -> `index.html`
  - `/api/*` -> matching serverless route
  - `/:code` -> `/api/redirect?code=:code`
- The frontend attempts both `/api/shorten` and `/shorten`, enabling compatibility across deployment modes.

## Validation and Error Handling

- URL is required and must include protocol
- Custom code must match allowed pattern and length
- Duplicate custom codes return `409 Conflict`
- Invalid methods return `405 Method Not Allowed` in serverless handlers

## Security and Best Practices

- Never commit secrets from `.env`
- Use environment-managed credentials in production
- Restrict MongoDB network access and rotate credentials when needed

## Future Improvements

- Click analytics per short code
- Link expiration and deactivation
- User authentication and dashboards
- Branded/custom domains
- Rate limiting and abuse prevention

## License

ISC (as defined in `package.json`)
