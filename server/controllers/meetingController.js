import { sql } from '../config/db.js';

// Helper to generate a 9-character code (e.g. abc-def-ghi)
const generateMeetingId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment(3)}-${segment(3)}-${segment(3)}`;
};

export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    // Fetch user details & plan
    const users = await sql`SELECT name, plan FROM users WHERE id = ${userId}`;
    const userPlan = users[0]?.plan || 'free';
    const hostName = users[0]?.name || 'Host';

    // Check meeting limit per calendar month for Free plan (30 meetings max)
    if (userPlan === 'free') {
      const monthlyCountResult = await sql`
        SELECT COUNT(*) as count FROM meetings 
        WHERE host_id = ${userId} AND created_at >= date_trunc('month', now())
      `;
      const monthlyCount = parseInt(monthlyCountResult[0].count) || 0;

      if (monthlyCount >= 30) {
        return res.status(403).json({ error: 'Monthly meeting limit reached', limitReached: true, limit: 30 });
      }
    }

    // Ensure unique ID
    let meetingId = generateMeetingId();
    let existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    while (existing.length > 0) {
      meetingId = generateMeetingId();
      existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    }

    // Create Meeting
    const newMeetings = await sql`
      INSERT INTO meetings (meeting_id, title, host_id, status) 
      VALUES (${meetingId}, ${title || 'Instant Meeting'}, ${userId}, 'active')
      RETURNING id, meeting_id, title, host_id, status, created_at
    `;
    const meeting = newMeetings[0];

    // Insert host into participants
    await sql`
      INSERT INTO meeting_participants (meeting_id, user_id, name) 
      VALUES (${meeting.id}, ${userId}, ${hostName})
    `;

    res.status(201).json({ meeting });
  } catch (error) {
    console.error('Failed to create meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meetings = await sql`
      SELECT m.*, u.id as host_user_id, u.name as host_name, u.email as host_email 
      FROM meetings m 
      JOIN users u ON m.host_id = u.id 
      WHERE m.meeting_id = ${meetingId}
    `;

    if (meetings.length === 0) return res.status(404).json({ error: 'Meeting not found' });
    
    const meeting = meetings[0];
    if (meeting.status === 'ended') return res.status(400).json({ error: 'This meeting has ended' });

    res.json({
      meeting: {
        id: meeting.id,
        meeting_id: meeting.meeting_id,
        title: meeting.title,
        status: meeting.status,
        created_at: meeting.created_at,
        host: { id: meeting.host_user_id, name: meeting.host_name, email: meeting.host_email }
      }
    });
  } catch (error) {
    console.error('Fetch meeting failed:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

export const getMeetingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await sql`SELECT plan FROM users WHERE id = ${userId}`;
    const plan = users[0]?.plan || 'free';

    const monthlyCountResult = await sql`
      SELECT COUNT(*) as count FROM meetings 
      WHERE host_id = ${userId} AND created_at >= date_trunc('month', now())
    `;
    const monthlyCount = parseInt(monthlyCountResult[0].count) || 0;

    res.json({
      plan,
      monthlyCount,
      monthlyLimit: plan === 'premium' ? null : 30,
      maxParticipants: plan === 'premium' ? 100 : 10
    });
  } catch (error) {
    console.error('Get meeting stats failed:', error);
    res.status(500).json({ error: 'Failed to get meeting stats' });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all meetings where the user is either the host OR participated
    const meetings = await sql`
      SELECT DISTINCT m.id, m.meeting_id, m.title, m.status, m.created_at, m.ended_at
      FROM meetings m
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      WHERE m.host_id = ${userId} OR mp.user_id = ${userId}
      ORDER BY m.created_at DESC
    `;

    // Attach basic participant and message counts for the UI dashboard cards
    const formattedMeetings = await Promise.all(meetings.map(async (m) => {
      const participants = await sql`SELECT id FROM meeting_participants WHERE meeting_id = ${m.id}`;
      const messages = await sql`SELECT id FROM meeting_messages WHERE meeting_id = ${m.id}`;
      
      return { ...m, participants, messages };
    }));

    res.json({ meetings: formattedMeetings });
  } catch (error) {
    console.error('Get user sessions failed:', error);
    res.status(500).json({ error: 'Failed to get user sessions' });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const meetings = await sql`
      SELECT m.*, u.id as host_user_id, u.name as host_name, u.email as host_email 
      FROM meetings m JOIN users u ON m.host_id = u.id 
      WHERE m.meeting_id = ${id}
    `;

    if (meetings.length === 0) return res.status(404).json({ error: 'Session details not found' });
    const m = meetings[0];

    // Authorization check
    const participants = await sql`
      SELECT mp.*, u.email 
      FROM meeting_participants mp 
      LEFT JOIN users u ON mp.user_id = u.id 
      WHERE mp.meeting_id = ${m.id}
    `;
    
    const isHost = m.host_id === userId;
    const isParticipant = participants.some(p => p.user_id === userId);
    if (!isHost && !isParticipant) {
      return res.status(403).json({ error: 'Not authorized to view these session details' });
    }

    const messages = await sql`
      SELECT * FROM meeting_messages 
      WHERE meeting_id = ${m.id} ORDER BY timestamp ASC
    `;

    res.json({
      meeting: {
        id: m.id,
        meeting_id: m.meeting_id,
        title: m.title,
        status: m.status,
        created_at: m.created_at,
        ended_at: m.ended_at,
        host: { id: m.host_user_id, name: m.host_name, email: m.host_email },
        participants,
        messages
      }
    });
  } catch (error) {
    console.error('Get session details failed:', error);
    res.status(500).json({ error: 'Failed to get session details' });
  }
};