# ⚛️ Shnoor Meetings Frontend

Modern, glassmorphic video conferencing interface built with **React** and **Vite**.

---

## 🚀 Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create or update `src/utils/api.js` or a `.env` file:
   - `VITE_API_BASE_URL`: Pointer to your Backend service.

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 🎨 UI & Features

- **Direct Join**: Bypasses traditional "Ask to Join" mechanics for an instant experience.
- **Video Grid**: Auto-scaling layout for multiple participants.
- **Live Captions**: Real-time speech-to-text overlay.
- **Glassmorphic Design**: Professional blur effects and vibrant color palettes.

---

## 🔌 Core Hooks

- **`useWebRTC`**: The brain of the application. Manages media streams, ICE candidate buffering, and "Perfect Negotiation."
- **`liveCaptionService`**: Handles integration with browser speech recognition APIs.

---

## 🚢 Production Build

```bash
npm run build
```

The output will be in the `/dist` folder. For **Render**, ensure you set the **`/* -> /index.html`** rewrite rule in the dashboard to support smooth React Router navigation.
