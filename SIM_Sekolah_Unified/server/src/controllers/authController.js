import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const login = async (req, res) => {
  try {
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
        errors: {
          nip: ['NIP atau password salah.']
        }
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          nip: ['NIP atau password salah.']
        }
      });
    }

    const payload = {
      sub: user.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req, res) => {
  return res.json({
    message: 'Logged out successfully'
  });
};

export const getUser = async (req, res) => {
  return res.json(req.user);
};
