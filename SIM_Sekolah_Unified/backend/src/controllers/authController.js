import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loginUser = asyncHandler(async (req, res) => {
  const { nip, password } = req.body;

  if (!nip || !password) {
    return res.status(422).json({
      message: 'Validation error',
      errors: {
        nip: !nip ? ['NIP field is required'] : [],
        password: !password ? ['Password field is required'] : []
      }
    });
  }

  const user = await User.findOne({ where: { nip } });

  if (!user) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { nip: ['NIP atau password salah.'] }
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { nip: ['NIP atau password salah.'] }
    });
  }

  const payload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) 
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);

  const userResponse = user.toJSON();
  delete userResponse.password;

  return res.json({
    user: userResponse,
    token
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.json(req.user);
});
