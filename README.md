#twitter-chunked-upload 🚀

Chunked Video Uploads for X (Twitter)



Tired of unreliable, low-code Twitter chunked upload workflows? This app handles large video uploads to X automatically, using the official API v2 chunked upload endpoints.

Features

Fully automated chunked video uploads

OAuth 2.0 authentication

Upload history tracking

Handles large videos in multiple chunks (2MB recommended)

Clear error handling

Quick Start
1. Clone the repo
git clone https://github.com/yourusername/twitter-chunked-upload.git
cd twitter-chunked-upload

2. Install dependencies
npm install

3. Configure environment variables

Create a .env file with your X developer account credentials:

X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
OAUTH_CALLBACK_URL=http://localhost:3000/callback

4. Start the app
npm start

5. Connect your X account

Visit http://localhost:3000 and authenticate via OAuth 2.0.

API Overview
Upload Video

Endpoint: POST /api/upload
Uploads a video file with optional metadata. Handles chunked upload automatically.

Parameters:

Parameter	Type	Required	Description
video	File	Yes	Video file (MP4, MOV supported)
title	String	No	Video title (default: "Untitled Video")
description	String	No	Optional description of the video

Example Curl:

curl -X POST http://localhost:3000/api/upload \
  -F "video=@video.mp4" \
  -F "title=My Awesome Video" \
  -F "description=Check out this amazing video!"

Upload History

Endpoint: GET /api/uploads
Retrieve the history of all uploads with current status.

Authentication Status

Endpoint: GET /api/auth/status
Check if your account is connected:

curl -X GET http://localhost:3000/api/auth/status

Upload Status Values

pending – Queued, waiting to start

processing – Upload in progress

success – Completed successfully

failed – Upload failed

Error Codes
Code	Error	Description
401	Unauthorized	X account not connected / OAuth expired
400	Bad Request	Missing required fields or invalid format
413	Payload Too Large	Video exceeds size limit
500	Internal Server Error	X API or server issue
Rate Limits

Free tier: ~17 uploads/day, 85 chunks/day

Recommended chunk size: 2MB (max 5MB)

Media expires 24 hours if not finalized
