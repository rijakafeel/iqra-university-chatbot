// ============================================
// db.js - PostgreSQL Database Connection
// ============================================

const { Pool } = require("pg");

// Create a connection pool for better performance
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "iqra_chatbot",
  max: 10,               // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Test the database connection on startup
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
    return true;
  } catch (error) {
    console.warn("⚠️  PostgreSQL connection failed:", error.message);
    console.warn("   Chat history will not be saved. App will still work.");
    return false;
  }
}

/**
 * Save a message to the database
 * @param {string} sessionId - Unique session identifier
 * @param {string} role      - 'user' or 'bot'
 * @param {string} message   - The message text
 */
async function saveMessage(sessionId, role, message) {
  try {
    // Upsert session row (INSERT ... ON CONFLICT DO NOTHING)
    await pool.query(
      `INSERT INTO chat_sessions (session_id)
       VALUES ($1)
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId]
    );

    // Save the message
    await pool.query(
      `INSERT INTO chat_messages (session_id, role, message)
       VALUES ($1, $2, $3)`,
      [sessionId, role, message]
    );
  } catch (error) {
    // Non-critical — log but don't crash the app
    console.warn("⚠️  Could not save message to DB:", error.message);
  }
}

/**
 * Retrieve chat history for a session
 * @param {string} sessionId - Unique session identifier
 * @param {number} limit     - Max messages to retrieve
 */
async function getChatHistory(sessionId, limit = 20) {
  try {
    const result = await pool.query(
      `SELECT role, message, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [sessionId, limit]
    );
    return result.rows;
  } catch (error) {
    console.warn("⚠️  Could not fetch chat history:", error.message);
    return [];
  }
}

module.exports = { pool, testConnection, saveMessage, getChatHistory };
