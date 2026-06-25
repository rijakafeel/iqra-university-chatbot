// ============================================
// main.js - Iqra University Chatbot Frontend
// ============================================
// Handles: Chat UI, API calls, session management
// ============================================

// --- Configuration ---
const API_BASE_URL = "http://localhost:3000/api";

// --- DOM Elements ---
const messagesArea = document.getElementById("messages-area");
const welcomeScreen = document.getElementById("welcome-screen");
const messagesList = document.getElementById("messages-list");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// --- State ---
let sessionId = generateSessionId();
let isLoading = false;
let messageCount = 0;

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Generate a unique session ID for this browser session
 */
function generateSessionId() {
  // Reuse existing session if available
  let existing = sessionStorage.getItem("iqra_session_id");
  if (existing) return existing;

  // Create new session ID
  const newId = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  sessionStorage.setItem("iqra_session_id", newId);
  return newId;
}

// ============================================
// MESSAGE RENDERING
// ============================================

/**
 * Add a message to the chat UI
 * @param {string} text - Message content
 * @param {string} role - 'user' or 'bot'
 * @param {boolean} isError - Whether this is an error message
 */
function appendMessage(text, role, isError = false) {
  // Hide welcome screen on first message
  if (messageCount === 0) {
    welcomeScreen.classList.add("hidden");
    messagesList.style.display = "flex";
  }
  messageCount++;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Create message row
  const row = document.createElement("div");
  row.className = `message-row ${role}`;
  row.style.marginBottom = "12px";

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  if (role === "bot") {
    avatar.textContent = "🎓";
  } else {
    avatar.textContent = "U";
  }

  // Content wrapper
  const content = document.createElement("div");
  content.className = "msg-content";

  // Sender label
  const sender = document.createElement("div");
  sender.className = "msg-sender";
  sender.textContent = role === "bot" ? "IU Assistant" : "You";

  // Bubble
  const bubble = document.createElement("div");
  bubble.className = "bubble" + (isError ? " error-bubble" : "");

  // Format text: convert markdown-like line breaks and bold text
  bubble.innerHTML = formatMessage(text);

  // Time
  const time = document.createElement("div");
  time.className = "msg-time";
  time.textContent = timeStr;

  content.appendChild(sender);
  content.appendChild(bubble);
  content.appendChild(time);

  row.appendChild(avatar);
  row.appendChild(content);

  messagesList.appendChild(row);
  scrollToBottom();
}

/**
 * Format message text with simple markdown-like conversions
 * @param {string} text - Raw text from API
 * @returns {string} - HTML formatted text
 */
function formatMessage(text) {
  return text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* → <em>text</em>
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    // Wrap in paragraph
    .replace(/^(.*)$/, "<p>$1</p>");
}

/**
 * Scroll chat to the bottom
 */
function scrollToBottom() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// ============================================
// TYPING INDICATOR
// ============================================

function showTyping() {
  typingIndicator.classList.add("visible");
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.remove("visible");
}

// ============================================
// SEND MESSAGE
// ============================================

/**
 * Send a message to the backend and display the response
 * @param {string} message - The message to send
 */
async function sendMessage(message) {
  // Guard: don't send if empty or already loading
  if (!message.trim() || isLoading) return;

  // Disable input while processing
  isLoading = true;
  sendBtn.disabled = true;
  messageInput.disabled = true;

  // Display user message immediately
  appendMessage(message, "user");

  // Clear input
  messageInput.value = "";
  autoResizeInput();

  // Show typing animation
  showTyping();

  try {
    // Call backend API
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        sessionId: sessionId,
      }),
    });

    const data = await response.json();

    hideTyping();

    if (data.success) {
      // Show bot response
      appendMessage(data.message, "bot");
    } else {
      // Show API error
      appendMessage(
        data.error || "Sorry, I encountered an issue. Please try again.",
        "bot",
        true
      );
    }
  } catch (networkError) {
    // Network / server not running error
    hideTyping();
    appendMessage(
      "⚠️ Unable to connect to the server. Please make sure the backend is running on port 3000.",
      "bot",
      true
    );
    console.error("Network error:", networkError);
  } finally {
    // Re-enable input
    isLoading = false;
    sendBtn.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
  }
}

// ============================================
// INPUT HANDLING
// ============================================

/**
 * Auto-resize textarea as user types
 */
function autoResizeInput() {
  messageInput.style.height = "22px";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 140) + "px";
}

// Send on Enter (but Shift+Enter for new line)
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(messageInput.value);
  }
});

// Auto-resize textarea
messageInput.addEventListener("input", autoResizeInput);

// Send button click
sendBtn.addEventListener("click", () => {
  sendMessage(messageInput.value);
});

// ============================================
// QUICK CHIPS (Welcome Screen Suggestions)
// ============================================

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const question = chip.dataset.question;
    if (question) {
      messageInput.value = question;
      sendMessage(question);
    }
  });
});

// ============================================
// SIDEBAR QUICK TOPICS
// ============================================

document.querySelectorAll(".quick-topic-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const question = btn.dataset.question;
    if (question) {
      // Close sidebar on mobile
      closeSidebar();
      messageInput.value = question;
      sendMessage(question);
    }
  });
});

// ============================================
// NEW CHAT
// ============================================

document.getElementById("new-chat-btn").addEventListener("click", () => {
  // Reset session
  sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  sessionStorage.setItem("iqra_session_id", sessionId);

  // Clear messages
  messagesList.innerHTML = "";
  messageCount = 0;
  messagesList.style.display = "none";
  welcomeScreen.classList.remove("hidden");

  // Clear input
  messageInput.value = "";
  autoResizeInput();

  // Close sidebar on mobile
  closeSidebar();
  messageInput.focus();
});

// ============================================
// MOBILE SIDEBAR TOGGLE
// ============================================

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  document.body.style.overflow = "";
}

document.getElementById("hamburger-btn").addEventListener("click", openSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// ============================================
// HEALTH CHECK ON LOAD
// ============================================

/**
 * Check if backend is running when page loads
 */
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      console.log("✅ Backend connected successfully");
    }
  } catch (e) {
    console.warn("⚠️ Backend not reachable. Start the server with: node server.js");
    // Show warning in the welcome screen
    const hint = document.createElement("div");
    hint.style.cssText =
      "margin-top:20px; padding:12px 16px; background:#FFF3CD; border:1px solid #F0C040; border-radius:10px; font-size:13px; color:#856404; max-width:420px; text-align:left;";
    hint.innerHTML =
      "⚠️ <strong>Backend not running.</strong> Please start the server:<br><code style='background:#f5e79e; padding:2px 6px; border-radius:4px; font-size:12px;'>cd backend && npm install && node server.js</code>";
    document.querySelector(".welcome-screen").appendChild(hint);
  }
}

// Initialize
checkBackendHealth();
messageInput.focus();
