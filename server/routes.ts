import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import axios from "axios";
import { randomBytes, createHash } from "crypto";

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 512 * 1024 * 1024, // 512MB max file size
  },
});

// Simple session storage (in production, use Redis or database)
const sessions = new Map<string, { userId: string; codeVerifier?: string }>();

// X API v2 endpoints
const X_API_BASE = "https://api.x.com/2";
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks

async function uploadVideoToX(
  videoBuffer: Buffer,
  mimeType: string,
  accessToken: string,
): Promise<{ mediaId: string; mediaKey: string; processingState?: string }> {
  const totalBytes = videoBuffer.length;

  // Step 1: INIT - Initialize upload
  console.log("INIT: Sending upload initialization request", {
    url: `${X_API_BASE}/media/upload/initialize`,
    body: {
      media_type: mimeType,
      total_bytes: totalBytes,
      media_category: "tweet_video",
    },
  });

  const initResponse = await axios.post(
    `${X_API_BASE}/media/upload/initialize`,
    {
      media_type: mimeType,
      total_bytes: totalBytes,
      media_category: "tweet_video",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log(
    "INIT: Response received",
    JSON.stringify(initResponse.data, null, 2),
  );

  const mediaId = initResponse.data.data.id;
  console.log("INIT: Extracted mediaId:", mediaId);

  if (!mediaId) {
    throw new Error("Failed to extract media ID from INIT response");
  }

  // Step 2: APPEND - Upload chunks (JSON with base64-encoded media)
  let segmentIndex = 0;
  for (let offset = 0; offset < totalBytes; offset += CHUNK_SIZE) {
    const chunk = videoBuffer.slice(
      offset,
      Math.min(offset + CHUNK_SIZE, totalBytes),
    );

    console.log(
      `APPEND: Uploading chunk ${segmentIndex}, size: ${chunk.length} bytes to media_id: ${mediaId}`,
    );

    await axios.post(
      `${X_API_BASE}/media/upload/${mediaId}/append`,
      {
        segment_index: segmentIndex,
        media: chunk.toString("base64"),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    segmentIndex++;
  }

  // Step 3: FINALIZE - Complete upload
  console.log("FINALIZE: Completing upload for media_id:", mediaId);

  const finalizeResponse = await axios.post(
    `${X_API_BASE}/media/upload/${mediaId}/finalize`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log(
    "FINALIZE: Response received",
    JSON.stringify(finalizeResponse.data, null, 2),
  );

  const processingInfo = finalizeResponse.data.data?.processing_info;
  const mediaKey = finalizeResponse.data.data?.media_key;

  return {
    mediaId,
    mediaKey,
    processingState: processingInfo?.state || "succeeded",
  };
}

async function postTweetWithRetry(
  accessToken: string,
  mediaId: string,
  text: string,
  retries = 3,
  delayMs = 15000, // Start with 15 seconds delay for video processing
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(
        `Attempting to post tweet (attempt ${attempt + 1}/${retries + 1})`,
      );

      const response = await axios.post(
        `${X_API_BASE}/tweets`,
        {
          text,
          media: {
            media_ids: [mediaId],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log(
        `Tweet posted successfully on attempt #${attempt + 1}`,
        response.data,
      );
      return response.data;
    } catch (err: any) {
      console.error(`Attempt #${attempt + 1} failed to post tweet:`, {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      // Check if it's a media processing error (video still processing)
      const isMediaProcessingError =
        err.response?.status === 400 &&
        err.response?.data?.detail?.includes("media");

      if (attempt < retries) {
        const nextDelay = delayMs * (attempt + 1); // Exponential backoff
        console.log(
          `Media might still be processing. Retrying in ${nextDelay / 1000} seconds...`,
        );
        await new Promise((res) => setTimeout(res, nextDelay));
      } else {
        console.error("All retry attempts failed.");
        throw err;
      }
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all uploads
  app.get("/api/uploads", async (_req, res) => {
    try {
      const uploads = await storage.getAllUploads();
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  // Upload video endpoint
  app.post("/api/upload", upload.single("video"), async (req, res) => {
    try {
      const { title, description } = req.body;
      const videoFile = req.file;

      if (!videoFile) {
        return res
          .status(400)
          .json({ success: false, error: "No video file provided" });
      }

      // Check if user is authenticated (using a simple session)
      const userId = "default_user"; // Simplified for MVP
      const token = await storage.getToken(userId);

      if (!token) {
        return res.status(401).json({
          success: false,
          error:
            "Authentication required. Please connect your X account first.",
        });
      }

      // Check if token is expired
      if (token.expiresAt && new Date() >= new Date(token.expiresAt)) {
        console.error("Access token expired at:", token.expiresAt);
        return res.status(401).json({
          success: false,
          error: "Access token expired. Please reconnect your X account.",
          needsReauth: true,
        });
      }

      console.log("Using token for user:", token.username);
      console.log("Token expires at:", token.expiresAt);

      // Create upload record
      const uploadRecord = await storage.createUpload({
        title: title || "Untitled Video",
        description: description || null,
        status: "processing",
        fileSize: videoFile.size,
        mimeType: videoFile.mimetype,
      });

      // Upload to X API and post tweet in the background
      (async () => {
        try {
          // Step 1: Upload video to X
          const result = await uploadVideoToX(
            videoFile.buffer,
            videoFile.mimetype,
            token.accessToken,
          );

          console.log("Video upload completed, mediaId:", result.mediaId);

          // Step 2: Create tweet text from title and description
          const tweetText =
            [title, description].filter(Boolean).join(" - ").trim() ||
            "Check out this video!";

          // Step 3: Post tweet with the uploaded media
          const tweetResponse = await postTweetWithRetry(
            token.accessToken,
            result.mediaId,
            tweetText,
          );

          // Step 4: Update upload record with success and tweet info
          await storage.updateUploadStatus(
            uploadRecord.id,
            "success",
            result.mediaId,
            result.mediaKey,
            undefined,
            result.processingState,
            tweetResponse.data?.id, // Store the tweet ID
          );

          console.log("Upload and tweet completed successfully:", {
            uploadId: uploadRecord.id,
            mediaId: result.mediaId,
            tweetId: tweetResponse.data?.id,
          });
        } catch (error: any) {
          console.error("Error in background upload process:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: JSON.stringify(error.response?.data, null, 2),
          });

          let errorMessage = "Upload failed";
          if (error.response?.status === 403) {
            errorMessage =
              "Access forbidden. Your X account token may be invalid or expired. Please reconnect your account.";
          } else if (error.response?.status === 401) {
            errorMessage = "Unauthorized. Please reconnect your X account.";
          } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.message) {
            errorMessage = error.message;
          }

          await storage.updateUploadStatus(
            uploadRecord.id,
            "failed",
            undefined,
            undefined,
            errorMessage,
          );
        }
      })();

      res.json({
        success: true,
        upload: uploadRecord,
        message: "Video upload and tweet posting started successfully",
      });
    } catch (error: any) {
      console.error("Error in upload endpoint:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  });

  // Check authentication status
  app.get("/api/auth/status", async (_req, res) => {
    try {
      const userId = "default_user";
      const token = await storage.getToken(userId);

      if (token) {
        res.json({
          authenticated: true,
          user: {
            userId: token.userId,
            username: token.username,
          },
        });
      } else {
        res.json({ authenticated: false });
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      res.status(500).json({ error: "Failed to check authentication status" });
    }
  });

  // Start OAuth flow
  app.get("/api/auth/connect", (req, res) => {
    const clientId = process.env.X_API_CLIENT_ID;

    if (!clientId) {
      return res
        .status(500)
        .json({ error: "X API credentials not configured" });
    }

    // Generate state and code verifier for PKCE (cryptographically secure)
    const state = randomBytes(32).toString("base64url");
    const codeVerifier = randomBytes(32).toString("base64url");

    // Generate code challenge using SHA-256
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Store session
    sessions.set(state, { userId: "default_user", codeVerifier });

    // OAuth 2.0 authorization URL - use Replit domain if available
    const host = process.env.REPLIT_DEV_DOMAIN || req.get("host");
    const protocol = process.env.REPLIT_DEV_DOMAIN ? "https" : req.protocol;
    const callbackUrl = `${protocol}://${host}/api/auth/callback`;
    // X API v2 OAuth 2.0 scopes - including media.write for uploads
    const scopes = [
      "tweet.read",
      "tweet.write",
      "users.read",
      "media.write",
      "offline.access",
    ].join(" ");

    const authUrl =
      `https://twitter.com/i/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    res.redirect(authUrl);
  });

  // OAuth callback
  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code, state, error, error_description } = req.query;

      // Check for OAuth errors from X
      if (error) {
        console.error("OAuth error from X:", error, error_description);
        return res
          .status(400)
          .send(`Authentication failed: ${error_description || error}`);
      }

      if (!code || !state) {
        console.error("Missing code or state:", {
          code: !!code,
          state: !!state,
        });
        return res.status(400).send("Invalid callback parameters");
      }

      const session = sessions.get(state as string);
      if (!session) {
        console.error("Invalid state - no session found:", state);
        return res
          .status(400)
          .send("Invalid state parameter. Please try again.");
      }

      const clientId = process.env.X_API_CLIENT_ID;
      const clientSecret = process.env.X_API_CLIENT_SECRET2;

      // Debug: Log all X_API environment variables
      const envKeys = Object.keys(process.env).filter((key) =>
        key.startsWith("X_API"),
      );
      console.log("Available X_API env vars:", envKeys);
      console.log("CLIENT_ID present:", !!clientId);
      console.log("CLIENT_SECRET2 present:", !!clientSecret);

      if (!clientId || !clientSecret) {
        console.error(
          "Missing credentials - clientId:",
          !!clientId,
          "clientSecret:",
          !!clientSecret,
        );
        return res.status(500).send("X API credentials not configured");
      }

      // Exchange code for access token - use Replit domain if available
      const host = process.env.REPLIT_DEV_DOMAIN || req.get("host");
      const protocol = process.env.REPLIT_DEV_DOMAIN ? "https" : req.protocol;
      const callbackUrl = `${protocol}://${host}/api/auth/callback`;
      console.log("Exchanging code for token, callback URL:", callbackUrl);

      const tokenResponse = await axios.post(
        "https://api.twitter.com/2/oauth2/token",
        new URLSearchParams({
          code: code as string,
          grant_type: "authorization_code",
          client_id: clientId,
          redirect_uri: callbackUrl,
          code_verifier: session.codeVerifier || "",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      console.log("Token exchange successful");

      // Get user info
      const userResponse = await axios.get(
        "https://api.twitter.com/2/users/me",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const username = userResponse.data.data.username;
      console.log("User authenticated:", username);

      // Store token
      await storage.createOrUpdateToken({
        userId: session.userId,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        username,
      });

      // Clean up session
      sessions.delete(state as string);

      // Redirect to authentication page
      res.redirect("/auth");
    } catch (error: any) {
      console.error("OAuth callback error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      res
        .status(500)
        .send(
          `Authentication failed: ${error.response?.data?.error_description || error.message}`,
        );
    }
  });

  // Disconnect account
  app.post("/api/auth/disconnect", async (_req, res) => {
    try {
      const userId = "default_user";
      await storage.deleteToken(userId);
      res.json({ success: true, message: "Account disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting account:", error);
      res.status(500).json({ error: "Failed to disconnect account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
