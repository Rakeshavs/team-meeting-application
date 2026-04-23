# 🚀 Shnoor Meetings: Ultimate Video Collaboration Suite

![Shnoor Meetings](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20WebRTC-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Shnoor Meetings** is a premium, low-latency video conferencing platform built for high-performance collaboration. This single document contains everything you need to build, deploy, and scale the application.

---

## ✨ Key Features

- **🛡️ Industrial WebRTC Stability**: Implements "Perfect Negotiation" and ICE candidate buffering to ensure 99.9% connectivity across all firewalls.
- **⚡ Direct-Join Experience**: Instant meeting entry via URL, optimized for seamless "Google Meet" style joining.
- **🎙️ Real-time Live Captions**: High-accuracy instant transcription overlay.
- **📱 Premium Responsive UI**: Modern glassmorphic design for all devices.
- **💬 Integrated Real-time Chat**: Low-latency communication synchronized across all participants.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS, Lucide Icons.
- **Backend**: FastAPI (Python), WebSockets for signaling.
- **Real-Time**: WebRTC P2P with global STUN/TURN support.
- **Database**: Supabase (PostgreSQL) for user management and authentication.

---

## 🚀 Full Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.8+](https://www.python.org/)

---

### 🐍 Step 1: Backend Setup (Signaling & Auth)

1. **Navigate & Install**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   Ensure `backend/.env` exists with:
   ```env
   DATABASE_URL=your_postgresql_url
   SUPABASE_URL=your_supabase_api_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Launch Server**:
   ```bash
   python main.py
   ```
   *Starting on `http://127.0.0.1:8000`*

---

### ⚛️ Step 2: Frontend Setup (Web UI)

1. **Navigate & Install**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Update `frontend/.env` (or `api.js`):
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Launch Application**:
   ```bash
   npm run dev
   ```
   *Visit `http://localhost:5173`*

---

## 🏗️ Architecture Details

- **Signaling**: WebSockets orchestrate the peer handshake.
- **Handshake**: "Perfect Negotiation" solves the "Glare" problem (simultaneous offers).
- **Resiliency**: Heartbeat monitoring prevents timeouts on Render.com.
- **UI Fallbacks**: Integrated avatar support if camera is disabled.

---

## ☁️ Deployment Guide (Render.com)

### 1. Backend (Web Service)
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Env Vars: `ALLOWED_ORIGINS` = Your frontend URL.

### 2. Frontend (Static Site)
- Build Command: `npm run build`
- Publish Directory: `dist`
- **Critical**: Set rewrite rules for SPA (`/*` -> `/index.html`).

---

## 🤝 Contributing & License

Distributed under the MIT License. Contributions are welcome via Pull Requests.

Developed with ❤️ by the Shnoor Meetings Team.
