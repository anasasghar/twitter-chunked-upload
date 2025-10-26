# twitter-chunked-upload 🚀

**Chunked Video Uploads for X (Twitter)**

Tired of unreliable, low-code Twitter chunked upload workflows? This app handles large video uploads to X automatically, using the official API v2 chunked upload endpoints.

This web application allows users to upload videos to X (Twitter) via a clean, full-stack interface. It features OAuth2 authentication, chunked uploads for large files, real-time status monitoring, and a fully documented API.

The platform is built with a **TypeScript React frontend**, **Express backend**, and **PostgreSQL database using Drizzle ORM**.

---

## Overview

- OAuth2 authentication with X (Twitter)  
- Upload videos using chunked uploads (2MB recommended)  
- Real-time upload status monitoring  
- REST API with interactive documentation  
- PostgreSQL database for persistent data  

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/x-video-upload.git
cd x-video-upload

# Install dependencies
npm install
````

1. Configure environment variables

Create a `.env` file with your X developer credentials and database info:

```env
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
OAUTH_CALLBACK_URL=http://localhost:5000/api/auth/callback
DATABASE_URL=postgres://user:password@host:port/dbname
```

2. Run the app

```bash
npm run dev
```

3. Connect X account
   Open [http://localhost:5000](http://localhost:5000) in your browser and authenticate via OAuth2.

---

## Recent Changes

**October 26, 2025 - Replit Environment Setup**

* Imported project from GitHub
* Installed missing dependency: `nanoid`
* Configured PostgreSQL database (Replit managed)
* Pushed schema using Drizzle Kit
* Set up development workflow: `npm run dev` on port 5000
* Updated browserslist database
* Configured deployment: autoscale mode
* Verified application is fully functional

---

## System Architecture

### Frontend

* Framework: React 18 + TypeScript, built with Vite
* Routing: Wouter (lightweight alternative to React Router)
* UI Components: shadcn/ui with Radix UI primitives
* Styling: Tailwind CSS with custom HSL-based design system
* Typography: Inter (UI), JetBrains Mono (code)
* State Management: TanStack Query (React Query)
* Pages: Dashboard, Authentication, API Documentation

### Backend

* Framework: Express.js + TypeScript, ESM modules
* File Uploads: Multer (in-memory storage, 512MB max)
* Chunked Upload: 2MB chunks for X API v2 compatibility
* Endpoints:

  * `/api/upload` – video upload
  * `/api/uploads` – upload history
  * `/api/auth/*` – OAuth2 authentication
* Session Management: In-memory Map (dev); production should use Redis or DB-backed sessions

### Database

* DB: PostgreSQL via Neon serverless
* ORM: Drizzle ORM
* Schema:

  * `oauth_tokens`: Stores user tokens and expiration
  * `uploads`: Tracks video upload status, media IDs, error messages
* Migration: Drizzle Kit, `/migrations` folder

### Authentication

* OAuth2 PKCE flow with X API v2
* Steps: Connect → Generate code verifier/challenge → Redirect → Token exchange → Store token
* Security: Code verifier never exposed to client; server-side token storage

---

## API Endpoints

### Upload Video

**POST /api/upload**

* Parameters: `video` (file), `title`, `description`
* Response: Video upload status and X media ID

### Upload History

**GET /api/uploads**

* Returns all past uploads with status (pending, processing, success, failed)

### Authentication Status

**GET /api/auth/status**

* Returns connected X user info

---

## Chunked Upload Flow
```
1. **INIT** – initialize upload with media type and size
2. **APPEND** – send 2MB chunks
3. **FINALIZE** – complete upload
4. Monitor processing state
```
---

## Dependencies

**Backend:**
```
@neondatabase/serverless, drizzle-orm, multer, axios
```
**Frontend:**
```
@tanstack/react-query, @radix-ui/*, tailwindcss, react-hook-form, zod, date-fns, wouter, ws
```
