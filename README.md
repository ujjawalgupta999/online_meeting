# 🎥 Online Meet

A production-ready, real-time video conferencing application built with **React, Node.js, WebRTC, and Socket.io**.  
This project implements **secure authentication via Clerk**, **peer-to-peer video streaming**, and a **serverless PostgreSQL database using Neon**.

---
## ✨ Features

- Real-time Video & Audio via WebRTC
- Live In-Meeting Text Chat
- User Authentication & Management with Clerk
- Subscription Tiers (Free & Premium Limits)
- Webhook Synchronization for Database Integrity
- Meeting Dashboard & Session Logs
- Secure Peer-to-Peer Connections

---

## 🧰 Tech Stack

### Frontend
- React (Vite)
- WebRTC API
- Socket.io-client
- Clerk (Authentication)
- React Hot Toast
- React Router DOM

### Backend
- Node.js
- Express.js
- Socket.io
- Neon (Serverless PostgreSQL)
- Clerk Express SDK
- Svix (Webhook Verification)

---

## 🚀 Installation & Setup

### server Setup

```bash
cd server
```
```
npm install
```
```
npm run server
```


### client Setup

```bash
cd client
```
```
npm install
```
```
npm run dev
```

Website runs on:  
`http://localhost:5173`