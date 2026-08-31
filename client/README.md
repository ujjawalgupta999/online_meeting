## 🌐 Frontend (React + Vite)

The frontend is built using **React** with **Vite** for fast development and optimized builds.  
It manages real-time peer-to-peer video streaming via **WebRTC**, handles signaling and live chat through **Socket.io**, and integrates **Clerk** for a secure, seamless authentication experience.

---

## 📦 Frontend Dependencies

### Core
- **react** – UI library
- **react-dom** – React DOM renderer
- **react-router-dom** – Client-side routing
- **socket.io-client** – WebSockets for WebRTC signaling and chat
- **@clerk/clerk-react** – Frontend user authentication and UI components
- **react-hot-toast** – Toast notifications for meeting and connection feedback

### Dev Tools
- **vite** – Development server & bundler
- **eslint** – Code linting
- **@vitejs/plugin-react** – React support for Vite

---

## ⚙️ Frontend Environment Variables

Create a `.env` file inside the **client** directory and add the following variables:

```env
# Clerk Publishable Key 
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Backend API URL
VITE_BASE_URL=http://localhost:3000
```
