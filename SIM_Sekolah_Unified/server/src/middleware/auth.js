import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.substring(7); 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.sub, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized - Token expired' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
