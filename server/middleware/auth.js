import { getAuth } from '@clerk/express';

export const protect = (req, res, next) => {
  try {
    const auth = getAuth(req);
    const userId = auth.userId || req.auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, authentication required' });
    }
    
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: 'Not authorized' });
  }
};