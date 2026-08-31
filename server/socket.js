import { sql } from './config/db.js';

export function setupSocketIO(io) {
  const rooms = new Map();

  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // User joins a meeting room
    socket.on('join-room', async ({ roomId, user, audioEnabled = true, videoEnabled = true }) => {
      try {
        const meetings = await sql`SELECT * FROM meetings WHERE meeting_id = ${roomId}`;
        if (meetings.length === 0) {
          socket.emit('meeting-ended', { message: 'Meeting not found' });
          return;
        }

        const meeting = meetings[0];
        if (meeting.status === 'ended') {
          socket.emit('meeting-ended', { message: 'This meeting has already ended' });
          return;
        }

        currentRoomId = roomId;
        currentUser = { socketId: socket.id, ...user, audioEnabled, videoEnabled };

        // Fetch host plan to enforce limits
        const hostResult = await sql`SELECT plan FROM users WHERE id = ${meeting.host_id}`;
        const hostPlan = hostResult[0]?.plan || 'free';
        const maxParticipants = hostPlan === 'premium' ? 100 : 10;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        const roomParticipants = rooms.get(roomId);

        if (roomParticipants.size >= maxParticipants) {
          socket.emit('meeting-ended', { 
            message: `Meeting capacity reached. Host must upgrade to Premium for up to 100 participants.` 
          });
          return;
        }

        socket.join(roomId);
        roomParticipants.set(socket.id, currentUser);

        // Save participant to DB if logged in
        if (user?.id) {
          const existing = await sql`
            SELECT id FROM meeting_participants 
            WHERE meeting_id = ${meeting.id} AND user_id = ${user.id}
          `;
          if (existing.length === 0) {
            await sql`
              INSERT INTO meeting_participants (meeting_id, user_id, name) 
              VALUES (${meeting.id}, ${user.id}, ${user.name || 'Anonymous'})
            `;
          }
        }

        const existingUsers = Array.from(roomParticipants.values());
        socket.emit('all-users', existingUsers);
        socket.to(roomId).emit('user-joined', currentUser);

      } catch (error) {
        console.error("Join Room Error:", error);
        socket.emit('meeting-ended', { message: 'Failed to join room' });
      }
    });

    // WebRTC Signaling
    socket.on('offer', ({ targetSocketId, callerSocketId, sdp, callerUser }) => {
      io.to(targetSocketId).emit('offer', { callerSocketId, sdp, callerUser });
    });

    socket.on('answer', ({ targetSocketId, responderSocketId, sdp }) => {
      io.to(targetSocketId).emit('answer', { responderSocketId, sdp });
    });

    socket.on('ice-candidate', ({ targetSocketId, senderSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { senderSocketId, candidate });
    });

    // Audio/Video Toggles
    socket.on('toggle-audio', ({ roomId, audioEnabled }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).audioEnabled = audioEnabled;
        socket.to(roomId).emit('user-toggled-audio', { socketId: socket.id, audioEnabled });
      }
    });

    socket.on('toggle-video', ({ roomId, videoEnabled }) => {
      if (rooms.has(roomId) && rooms.get(roomId).has(socket.id)) {
        rooms.get(roomId).get(socket.id).videoEnabled = videoEnabled;
        socket.to(roomId).emit('user-toggled-video', { socketId: socket.id, videoEnabled });
      }
    });

    // Chat Message
    socket.on('send-message', async ({ roomId, message }) => {
      try {
        const meetings = await sql`SELECT id FROM meetings WHERE meeting_id = ${roomId}`;
        if (meetings.length > 0) {
          const meetingId = meetings[0].id;
          await sql`
            INSERT INTO meeting_messages (meeting_id, sender_id, sender_name, text) 
            VALUES (${meetingId}, ${message.senderId}, ${message.senderName}, ${message.text})
          `;
          io.in(roomId).emit('receive-message', { ...message, senderSocketId: socket.id });
        }
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    // Host ends meeting
    socket.on('end-meeting', async ({ roomId }) => {
      try {
        await sql`UPDATE meetings SET status = 'ended', ended_at = NOW() WHERE meeting_id = ${roomId}`;
        io.in(roomId).emit('meeting-ended', { message: 'The meeting has ended by the host' });
        rooms.delete(roomId);
      } catch (error) {
        console.error('End meeting error:', error);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const roomParticipants = rooms.get(currentRoomId);
        roomParticipants.delete(socket.id);

        if (roomParticipants.size === 0) {
          rooms.delete(currentRoomId);
        } else {
          socket.to(currentRoomId).emit('user-left', { socketId: socket.id, user: currentUser });
        }
      }
    });
  });
}