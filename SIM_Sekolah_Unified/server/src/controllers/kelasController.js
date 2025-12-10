import { Kelas, User } from '../models/index.js';

export const index = async (req, res) => {
  try {
    const kelas = await Kelas.findAll({
      include: [{
        model: User,
        as: 'wali_kelas',
        attributes: { exclude: ['password'] }
      }]
    });
    return res.json(kelas);
  } catch (error) {
    console.error('Get kelas error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
    const { id_guru, nama_kelas, tingkat } = req.body;

    if (!nama_kelas || !tingkat) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          nama_kelas: !nama_kelas ? ['Nama kelas is required'] : [],
          tingkat: !tingkat ? ['Tingkat is required'] : []
        }
      });
    }

    if (!['7', '8', '9'].includes(tingkat)) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          tingkat: ['Tingkat must be 7, 8, or 9']
        }
      });
    }

    const kelas = await Kelas.create({
      id_guru: id_guru || null,
      nama_kelas,
      tingkat
    });

    const kelasWithGuru = await Kelas.findByPk(kelas.id, {
      include: [{
        model: User,
        as: 'wali_kelas',
        attributes: { exclude: ['password'] }
      }]
    });

    return res.status(201).json(kelasWithGuru);
  } catch (error) {
    console.error('Create kelas error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'wali_kelas',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!kelas) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    return res.json(kelas);
  } catch (error) {
    console.error('Get kelas error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id);

    if (!kelas) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    const { id_guru, nama_kelas, tingkat } = req.body;

    if (tingkat && !['7', '8', '9'].includes(tingkat)) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          tingkat: ['Tingkat must be 7, 8, or 9']
        }
      });
    }

    if (id_guru !== undefined) kelas.id_guru = id_guru;
    if (nama_kelas) kelas.nama_kelas = nama_kelas;
    if (tingkat) kelas.tingkat = tingkat;

    await kelas.save();

    const kelasWithGuru = await Kelas.findByPk(kelas.id, {
      include: [{
        model: User,
        as: 'wali_kelas',
        attributes: { exclude: ['password'] }
      }]
    });

    return res.json(kelasWithGuru);
  } catch (error) {
    console.error('Update kelas error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id);

    if (!kelas) {
      return res.status(404).json({ message: 'Kelas not found' });
    }

    await kelas.destroy();

    return res.json({ message: 'Kelas deleted successfully' });
  } catch (error) {
    console.error('Delete kelas error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
