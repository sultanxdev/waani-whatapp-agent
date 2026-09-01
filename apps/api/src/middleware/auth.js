import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import db from '../database/db.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For local rapid testing, assign default clinic staff user if no token provided
    const defaultUser = db.findOne('users', (u) => u.role === 'OWNER') || {
      id: 'user_owner_01',
      clinic_id: 'clinic_derma_care_01',
      name: 'Dr. Ananya Sharma',
      role: 'OWNER'
    };
    req.user = defaultUser;
    return next();
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const user = db.findOne('users', (u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}
