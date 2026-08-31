## 🖥️ Backend (Node.js + Express)

The backend is built using **Node.js** and **Express.js**, providing robust REST APIs, real-time WebRTC signaling via **Socket.io**, seamless database integration with **Neon PostgreSQL**, and secure authentication syncing via **Clerk Webhooks**.

---

## 📦 Backend Dependencies

The backend uses the following dependencies:

- **express** – Web framework
- **@neondatabase/serverless** – Serverless PostgreSQL driver for Neon
- **socket.io** – Real-time bidirectional event-based communication
- **@clerk/express** – Clerk authentication middleware
- **svix** – Webhook payload verification
- **cookie-parser** – Cookie handling
- **cors** – Cross-Origin Resource Sharing
- **dotenv** – Environment variables
- **nodemon** (dev) – Auto-restart server

---

## ⚙️ Backend Environment Variables

Create a `.env` file inside the **server** directory and add the following variables:

```env
# Server Configuration
PORT=3000
ORIGINS=http://localhost:5173

# Neon Database URL
DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Clerk Authentication Keys 
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Clerk Webhook Secret
SIGNING_SECRET=whsec_your_clerk_webhook_signing_secret
```
