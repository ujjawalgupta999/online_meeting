import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { Server } from 'socket.io';
import { clerkMiddleware } from '@clerk/express'; // Used globally for parsing clerk req contexts
import { setupSocketIO } from './socket.js';
import { initDB } from './config/db.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { handleClerkWebhook } from './controllers/webhookController.js';

const app = express();
const server = http.createServer(app);

// 1. Initialize Neon Database Schema
await initDB();

// 2. Base Middleware
app.use(cors({ 
  origin: process.env.ORIGINS?.split(',') || ['http://localhost:5173'], 
  credentials: true 
}));
app.use(cookieParser());

// 3. Clerk Webhook Route (MUST use raw JSON parser)
app.use('/api/clerk', express.raw({ type: 'application/json' }), handleClerkWebhook);

// 4. Standard Middleware
app.use(express.json());
app.use(clerkMiddleware()); // Parses authentication tokens automatically for REST endpoints

// 5. REST API Routes
app.use('/api/meetings', meetingRoutes);

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