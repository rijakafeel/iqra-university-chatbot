// ============================================
// server.js - Iqra University Chatbot Backend
// ============================================
// Main Express server with Gemini AI integration
// Run: node server.js (or npm run dev for auto-reload)
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { testConnection, saveMessage, getChatHistory } = require("./db");
const { generateResponse } = require("./gemini");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — allow frontend to connect
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Serve frontend static files (index.html, CSS, JS)
app.use(express.static("../frontend"));

// ============================================
// RATE LIMITING
// Prevents API abuse — max 30 requests per minute per IP
// ============================================
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: "Too many requests. Please wait a moment before sending another message.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// INPUT VALIDATION HELPER
// ============================================
function validateChatInput(body) {
  const errors = [];

  if (!body.message || typeof body.message !== "string") {
    errors.push("Message is required and must be a string.");
  } else if (body.message.trim().length === 0) {
    errors.push("Message cannot be empty.");
  } else if (body.message.trim().length > 1000) {
    errors.push("Message is too long. Maximum 1000 characters allowed.");
  }

  if (body.sessionId && typeof body.sessionId !== "string") {
    errors.push("Invalid session ID.");
  }

  return errors;
}

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/health
 * Health check endpoint to verify server is running
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Iqra University Chatbot API is running! 🎓",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * POST /api/chat
 * Main chat endpoint — receives user message, returns AI response
 * 
 * Request Body:
 * {
 *   "message": "What are the admission requirements?",
 *   "sessionId": "unique-session-id-123"  (optional)
 * }
 */
app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    // --- 1. Validate Input ---
    const validationErrors = validateChatInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors[0],
      });
    }

    const userMessage = req.body.message.trim();
    const sessionId = req.body.sessionId || `session_${Date.now()}`;

    console.log(`\n📨 [${new Date().toLocaleTimeString()}] Session: ${sessionId}`);
    console.log(`   User: ${userMessage.substring(0, 80)}...`);

    // --- 2. Fetch Chat History for Context ---
    const chatHistory = await getChatHistory(sessionId, 10);

    // --- 3. Save User Message to DB ---
    await saveMessage(sessionId, "user", userMessage);

    // --- 4. Generate AI Response ---
    const botResponse = await generateResponse(userMessage, chatHistory);

    // --- 5. Save Bot Response to DB ---
    await saveMessage(sessionId, "bot", botResponse);

    console.log(`   Bot: ${botResponse.substring(0, 80)}...`);

    // --- 6. Return Response ---
    return res.status(200).json({
      success: true,
      message: botResponse,
      sessionId: sessionId,
    });

  } catch (error) {
    console.error("❌ Chat Error:", error.message);

    // Handle specific Gemini API errors
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        error: "AI service configuration error. Please contact support.",
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        success: false,
        error: "AI service is temporarily busy. Please try again in a moment.",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "Something went wrong on our end. Please try again.",
    });
  }
});

/**
 * GET /api/history/:sessionId
 * Retrieve chat history for a specific session
 */
app.get("/api/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.length > 64) {
      return res.status(400).json({ success: false, error: "Invalid session ID." });
    }

    const history = await getChatHistory(sessionId, 50);

    return res.json({
      success: true,
      sessionId,
      messages: history,
    });
  } catch (error) {
    console.error("History Error:", error.message);
    return res.status(500).json({ success: false, error: "Could not fetch history." });
  }
});

/**
 * 404 Handler — for unknown routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred.",
  });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  console.log("\n🎓 ===================================");
  console.log("   Iqra University AI Chatbot");
  console.log("   Backend Server v1.0.0");
  console.log("=====================================\n");

  // Check environment variables
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("❌ ERROR: GEMINI_API_KEY is not set in your .env file!");
    console.error("   Please add your Gemini API key to the .env file.");
    console.error("   Get your key from: https://makersuite.google.com/app/apikey\n");
    process.exit(1);
  }

  // Test database connection (non-blocking)
  await testConnection();

  // Start the server
  app.listen(PORT, () => {
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`📡 Chat endpoint:     POST http://localhost:${PORT}/api/chat`);
    console.log(`❤️  Health check:     GET  http://localhost:${PORT}/api/health`);
    console.log(`\n💡 Open frontend/index.html in your browser to start chatting!\n`);
  });
}

startServer();
