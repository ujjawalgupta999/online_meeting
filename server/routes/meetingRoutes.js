import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  createMeeting, 
  getMeeting, 
  getUserSessions, 
  getSessionDetails, 
  getMeetingStats 
} from '../controllers/meetingController.js';

const meetingRouter = express.Router();

// All meeting routes require authentication
meetingRouter.use(protect);

meetingRouter.post('/', createMeeting);
meetingRouter.get('/stats', getMeetingStats);
meetingRouter.get('/sessions', getUserSessions);
meetingRouter.get('/sessions/:id', getSessionDetails);
meetingRouter.get('/:meetingId', getMeeting);

export default meetingRouter;