-- ============================================
-- Iqra University Chatbot - Database Schema
-- ============================================
-- Run this file to set up the PostgreSQL database:
-- psql -U postgres -f database.sql

-- Create database (run this separately if needed):
-- CREATE DATABASE iqra_chatbot;

-- Connect to the database:
\c iqra_chatbot;

-- Table: chat_sessions
-- Stores each unique chat session
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          SERIAL PRIMARY KEY,
  session_id  VARCHAR(64) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index on session_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_session_id ON chat_sessions (session_id);

-- Trigger function: auto-update last_active on any update to chat_sessions
-- (Replaces MySQL's ON UPDATE CURRENT_TIMESTAMP behaviour)
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_last_active
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Table: chat_messages
-- Stores all messages (user + bot) per session
-- Note: PostgreSQL does not support inline ENUM — using CHECK constraint instead
CREATE TABLE IF NOT EXISTS chat_messages (
  id          SERIAL PRIMARY KEY,
  session_id  VARCHAR(64) NOT NULL,
  role        VARCHAR(10) NOT NULL CHECK (role IN ('user', 'bot')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session
    FOREIGN KEY (session_id)
    REFERENCES chat_sessions (session_id)
    ON DELETE CASCADE
);

-- Indexes for fast filtering and sorting
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages (created_at);

-- View: recent_chats
-- Easy access to the latest 100 conversations
-- Note: PostgreSQL uses SUBSTRING() instead of MySQL's LEFT()
CREATE OR REPLACE VIEW recent_chats AS
SELECT
  cm.id,
  cm.session_id,
  cm.role,
  SUBSTRING(cm.message FROM 1 FOR 100) AS message_preview,
  cm.created_at
FROM chat_messages cm
ORDER BY cm.created_at DESC
LIMIT 100;

-- Confirm setup is complete
SELECT 'Database setup complete!' AS status;
