# X Video Upload Platform

## Overview

This is a web application that enables users to upload videos to X (Twitter) through a professional interface. The platform provides OAuth2 authentication with X, video upload functionality with chunked uploads for large files, upload tracking with real-time status monitoring, and comprehensive API documentation.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, utilizing PostgreSQL for persistent data storage and the X API v2 for video uploads.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 26, 2025 - Replit Environment Setup:**
- Successfully imported project from GitHub
- Installed missing dependency: nanoid
- Configured PostgreSQL database (Replit managed)
- Pushed database schema using Drizzle Kit
- Configured development workflow: `npm run dev` on port 5000
- Updated browserslist database to latest version
- Configured deployment: autoscale mode with build command
- Verified application is running correctly with all features operational

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Design System:**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with a custom design system
- Design approach follows Linear + Stripe hybrid patterns emphasizing clarity and developer experience
- Typography: Inter font family for UI, JetBrains Mono for code snippets
- Color system using CSS custom properties with HSL values for light/dark mode support

**State Management:**
- TanStack Query (React Query) for server state management and data fetching
- Custom query client configuration with credential-based requests
- Toast notifications using shadcn/ui toast system

**Page Structure:**
- Dashboard: Displays upload statistics and history with status badges
- Authentication: OAuth2 connection management with X
- API Documentation: Interactive API reference with code examples

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- ESM module system throughout the application
- HTTP server created via Node's built-in `http` module

**File Upload Handling:**
- Multer middleware with in-memory storage for file uploads
- 512MB maximum file size limit
- Chunked upload implementation (2MB chunks) for X API compatibility

**API Design:**
- RESTful endpoints under `/api` prefix
- Upload endpoint: `POST /api/upload` (multipart/form-data)
- Status endpoint: `GET /api/uploads` (returns all uploads)
- Auth endpoints: `/api/auth/connect`, `/api/auth/callback`, `/api/auth/status`, `/api/auth/disconnect`

**Session Management:**
- In-memory Map-based session storage for development
- Sessions store userId and OAuth code verifier for PKCE flow
- Note: Production deployment should migrate to Redis or database-backed sessions

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connections for Neon database (configured via ws library)

**Schema Design:**

*OAuth Tokens Table:*
- Stores X API authentication tokens per user
- Fields: id (UUID), userId (unique), accessToken, refreshToken, expiresAt, username, createdAt
- Supports token refresh flow for long-lived sessions

*Uploads Table:*
- Tracks video upload history and status
- Fields: id (UUID), title, description, status, mediaId, mediaKey, errorMessage, fileSize, mimeType, processingState, createdAt, completedAt
- Status values: pending, processing, success, failed
- Stores X media IDs and keys for post-upload operations

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Push command: `npm run db:push` for development schema updates

### Authentication & Authorization

**OAuth2 Implementation:**
- PKCE (Proof Key for Code Exchange) flow for enhanced security
- Authorization Code Grant type with X API v2
- Random state parameter generation for CSRF protection
- Code verifier/challenge using SHA-256 hashing

**Flow:**
1. User initiates connection via `/api/auth/connect`
2. Server generates code verifier and challenge, stores in session
3. Redirect to X authorization endpoint with PKCE parameters
4. X redirects back to `/api/auth/callback` with authorization code
5. Server exchanges code for access token using code verifier
6. Token stored in database, associated with X user ID

**Session Security:**
- Code verifier stored in session, never exposed to client
- State parameter validation on callback
- Tokens stored server-side only, never sent to frontend

### External Dependencies

**X (Twitter) API Integration:**
- API Version: v2
- Base URL: `https://api.x.com/2`
- Endpoints used:
  - OAuth2 authorization: `/oauth2/authorize`
  - Token exchange: `/oauth2/token`
  - Media upload: `/media/upload` (chunked upload protocol)
- Chunked Upload Flow:
  1. INIT: Initialize upload with media type and total bytes
  2. APPEND: Send 2MB chunks with raw binary data
  3. FINALIZE: Complete upload and trigger processing
  4. Processing states tracked: pending, in_progress, succeeded, failed

**Third-Party Services:**
- Neon Database (PostgreSQL hosting)
- Google Fonts CDN for Inter and JetBrains Mono fonts

**NPM Dependencies:**
- `@neondatabase/serverless`: Neon PostgreSQL driver with WebSocket support
- `drizzle-orm`: Type-safe ORM and query builder
- `multer`: Multipart form data handling for file uploads
- `axios`: HTTP client for X API requests
- `@tanstack/react-query`: Data fetching and caching
- `@radix-ui/*`: Headless UI component primitives
- `tailwindcss`: Utility-first CSS framework
- `react-hook-form` + `zod`: Form validation and schema validation
- `date-fns`: Date formatting utilities
- `wouter`: Lightweight routing
- `ws`: WebSocket client for Neon connections

**Development Tools:**
- Vite with React plugin
- TypeScript compiler
- ESBuild for server bundling
- tsx for development server execution
- Replit-specific plugins: runtime error overlay, cartographer, dev banner