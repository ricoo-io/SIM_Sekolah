import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  return res.json(users);
});

export const getAllTeachers = asyncHandler(async (req, res) => {
  const guruList = await User.findAll({
    where: {
      role: 'guru',
      wali_kelas: true
    },
    attributes: { exclude: ['password'] }
  });
  return res.json(guruList);
});

export const addUser = asyncHandler(async (req, res) => {
  const { nama, nip, password, role, wali_kelas } = req.body;

  if (!nama || !nip || !password || !role) {
    return res.status(422).json({
      message: 'Validation error',
      errors: {
        nama: !nama ? ['Nama field is required'] : [],
        nip: !nip ? ['NIP field is required'] : [],
        password: !password ? ['Password field is required'] : [],
        role: !role ? ['Role field is required'] : []
      }
    });
  }

  if (password.length < 6) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { password: ['Password must be at least 6 characters'] }
    });
  }

  if (!['admin', 'guru'].includes(role)) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { role: ['Role must be either admin or guru'] }
    });
  }

  const existingUser = await User.findOne({ where: { nip } });
  if (existingUser) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { nip: ['NIP already exists'] }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    nama,
    nip,
    password: hashedPassword,
    role,
    wali_kelas: wali_kelas || false
  });

  const userResponse = user.toJSON();
  delete userResponse.password;

  return res.status(201).json(userResponse);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { nama, nip, password, role, wali_kelas } = req.body;

  if (nip && nip !== user.nip) {
    const existingUser = await User.findOne({ where: { nip } });
    if (existingUser) {
      return res.status(422).json({
        message: 'Validation error',
        errors: { nip: ['NIP already exists'] }
      });
    }
  }

  if (nama) user.nama = nama;
  if (nip) user.nip = nip;
  if (password) {
    if (password.length < 6) {
      return res.status(422).json({
        message: 'Validation error',
        errors: { password: ['Password must be at least 6 characters'] }
      });
    }
    user.password = await bcrypt.hash(password, 10);
  }
  if (role) {
    if (!['admin', 'guru'].includes(role)) {
      return res.status(422).json({
        message: 'Validation error',
        errors: { role: ['Role must be either admin or guru'] }
      });
    }
    user.role = role;
  }
  if (wali_kelas !== undefined) user.wali_kelas = wali_kelas;

  await user.save();

  const userResponse = user.toJSON();
  delete userResponse.password;

  return res.json(userResponse);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await user.destroy();
  return res.json({ message: 'User deleted successfully' });
});
