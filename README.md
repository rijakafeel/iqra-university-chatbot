# 🎓 Iqra University AI Chatbot

A modern, AI-powered chatbot for Iqra University built with **Node.js**, **Express**, **Google Gemini API**, **MySQL**, and a clean responsive frontend.

---

## 📸 Features

- ✅ **ChatGPT-style UI** with modern chat bubbles
- ✅ **Google Gemini AI** powering intelligent responses
- ✅ **University context** — answers about admissions, fees, programs, scholarships
- ✅ **Typing indicator** with animated dots
- ✅ **Chat history** stored in MySQL
- ✅ **Session-based** multi-turn conversations
- ✅ **Rate limiting** to prevent API abuse
- ✅ **Mobile responsive** with sidebar navigation
- ✅ **Quick topic shortcuts** in sidebar
- ✅ **Beginner-friendly** clean code with comments

---

## 📁 Project Structure

```
iqra-university-chatbot/
│
├── backend/                    # Node.js + Express backend
│   ├── server.js              # Main Express server
│   ├── gemini.js              # Google Gemini AI integration
│   ├── db.js                  # MySQL database connection
│   ├── database.sql           # SQL schema to set up tables
│   ├── package.json           # Node.js dependencies
│   ├── .env.example           # Environment variables template
│   └── .env                   # Your actual env file (create this!)
│
├── frontend/                   # Static HTML/CSS/JS frontend
│   ├── index.html             # Main chat interface
│   └── assets/
│       ├── css/
│       │   └── style.css      # All styles
│       └── js/
│           └── main.js        # Chat logic & API calls
│
├── .gitignore                 # Ignores node_modules, .env
└── README.md                  # This file
```

---

## 🚀 Installation Guide

### Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | >= 18.x | https://nodejs.org |
| npm | >= 9.x | Comes with Node.js |
| MySQL | >= 8.x | https://dev.mysql.com/downloads/ |
| Git | Any | https://git-scm.com |

---

### Step 1: Clone or Download the Project

```bash
# If using git
git clone https://github.com/yourname/iqra-university-chatbot.git
cd iqra-university-chatbot

# Or just extract the ZIP file and navigate to the folder
```

---

### Step 2: Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key — you'll need it in the next step

> 💡 **Free tier available!** Gemini offers a generous free quota for development.

---

### Step 3: Set Up Environment Variables

```bash
# Go into the backend folder
cd backend

# Copy the example .env file
cp .env.example .env

# Open .env in any text editor and fill in your values
```

Edit `backend/.env`:

```env
PORT=3000
NODE_ENV=development

# Paste your Gemini API key here
GEMINI_API_KEY=AIzaSy_your_actual_key_here

# Your MySQL credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=iqra_chatbot

ALLOWED_ORIGIN=http://localhost:5500
```

---

### Step 4: Set Up the MySQL Database

```bash
# Log in to MySQL (enter your password when prompted)
mysql -u root -p

# Run the setup script
source /path/to/iqra-university-chatbot/backend/database.sql;

# Or from terminal:
mysql -u root -p < backend/database.sql
```

You should see: `Database setup complete!`

---

### Step 5: Install Backend Dependencies

```bash
# Make sure you're in the backend folder
cd backend

# Install all packages
npm install
```

---

### Step 6: Start the Backend Server

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
🎓 =====================================
   Iqra University AI Chatbot
   Backend Server v1.0.0
=====================================

✅ MySQL connected successfully
✅ Server running on: http://localhost:3000
📡 Chat endpoint:     POST http://localhost:3000/api/chat
```

---

### Step 7: Open the Frontend

**Option A: Open directly in browser** (simplest)
```bash
# Just open the file in your browser
open frontend/index.html
# Or double-click index.html in your file explorer
```

**Option B: Use VS Code Live Server** (recommended)
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `frontend/index.html`
3. Select **"Open with Live Server"**

**Option C: Use Python HTTP Server**
```bash
cd frontend
python -m http.server 5500
# Then open http://localhost:5500
```

---

## ✅ Testing the Chatbot

Once running, try asking:

- *"What programs does Iqra University offer?"*
- *"What are the admission requirements for BSCS?"*
- *"How much is the fee for BBA?"*
- *"What scholarships are available?"*
- *"Where is the Karachi campus located?"*

---

## 🔧 Troubleshooting

### ❌ "Backend not running" warning in chat
- Make sure you ran `npm start` in the backend folder
- Check that port 3000 is not already in use: `lsof -i :3000`

### ❌ "AI service configuration error"
- Check your `GEMINI_API_KEY` in `.env` — make sure it's correct
- Verify your key at https://makersuite.google.com

### ❌ MySQL connection failed
- This is **non-blocking** — the chatbot still works, but history won't be saved
- Verify MySQL is running: `sudo systemctl start mysql`
- Check your DB credentials in `.env`

### ❌ CORS error in browser console
- Update `ALLOWED_ORIGIN` in `.env` to match your frontend URL
- Example: `ALLOWED_ORIGIN=http://127.0.0.1:5500`

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/chat` | Send message, receive AI response |
| GET | `/api/history/:sessionId` | Get chat history |

### POST /api/chat — Request Body
```json
{
  "message": "What programs does Iqra University offer?",
  "sessionId": "sess_1234567_abc"
}
```

### POST /api/chat — Response
```json
{
  "success": true,
  "message": "Iqra University offers a wide range of programs...",
  "sessionId": "sess_1234567_abc"
}
```

---

## 🛠 Customization

### Update University Information
Edit the `UNIVERSITY_SYSTEM_PROMPT` in `backend/gemini.js` to:
- Add real fee amounts
- Update admission dates
- Add new programs
- Change contact details

### Change the Theme Colors
Edit CSS variables at the top of `frontend/assets/css/style.css`:
```css
:root {
  --color-primary: #006B6B;   /* Change to your brand color */
  --color-navy: #0F2A4A;
  --color-gold: #C9A84C;
}
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js 18+, Express.js 4 |
| AI | Google Gemini 1.5 Flash |
| Database | MySQL 8 |
| Security | Helmet, CORS, Rate Limiting |

---

## 👨‍💻 Built by

Developed as a full-stack student project for Iqra University.

**Powered by:** Google Gemini AI 🤖 | **University:** Iqra University 🎓
