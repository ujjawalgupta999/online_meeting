import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { Server } from 'socket.io';
import { clerkMiddleware } from '@clerk/express';
import { setupSocketIO } from './socket.js';
import { initDB } from './config/db.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { handleClerkWebhook } from './controllers/webhookController.js';

const app = express();

// 1. CORS MUST come first
app.use(cors({
  origin: ['https://onlinemeeet.netlify.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
// app.options('/(.*)', cors());

const server = http.createServer(app);

// 2. Initialize Neon Database Schema
await initDB();
app.use(cookieParser());

// 3. Clerk Webhook Route (MUST use raw JSON parser)
app.use('/api/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

// 4. Standard Middleware
app.use(express.json());
app.use(clerkMiddleware());

// 5. REST API Routes
app.use('/api/meetings', meetingRoutes);

// ... rest of your socket.io and server code ...

// 6. Root status check
app.get('/', (req, res) => res.send('API is live'));

// 7. Socket.io setup
const io = new Server(server, {
  cors: { 
    origin: process.env.ORIGINS?.split(',') || ['http://localhost:5173'], 
    credentials: true 
  }
});
setupSocketIO(io);

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

// 9. Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;