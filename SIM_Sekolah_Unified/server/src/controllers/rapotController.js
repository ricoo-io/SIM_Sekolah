import { Rapot, Siswa } from '../models/index.js';

export const index = async (req, res) => {
  try {
    const rapot = await Rapot.findAll({
      include: [{
        model: Siswa,
        as: 'siswa'
      }]
    });
    return res.json(rapot);
  } catch (error) {
    console.error('Get rapot error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
    const {
      id_siswa,
      tahun_ajaran,
      semester,
      sakit,
      izin,
      alpha,
      catatan_wali_kelas
    } = req.body;

    if (!id_siswa || !tahun_ajaran || !semester) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          id_siswa: !id_siswa ? ['Siswa is required'] : [],
          tahun_ajaran: !tahun_ajaran ? ['Tahun ajaran is required'] : [],
          semester: !semester ? ['Semester is required'] : []
        }
      });
    }

    if (!['ganjil', 'genap'].includes(semester)) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          semester: ['Semester must be either ganjil or genap']
        }
      });
    }

    const rapot = await Rapot.create({
      id_siswa,
      tahun_ajaran,
      semester,
      sakit: sakit || 0,
      izin: izin || 0,
      alpha: alpha || 0,
      catatan_wali_kelas
    });

    const rapotWithSiswa = await Rapot.findByPk(rapot.id, {
      include: [{
        model: Siswa,
        as: 'siswa'
      }]
    });

    return res.status(201).json(rapotWithSiswa);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          combination: ['Rapot for this student, tahun ajaran, and semester already exists']
        }
      });
    }
    console.error('Create rapot error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
    const rapot = await Rapot.findByPk(req.params.id, {
      include: [{
        model: Siswa,
        as: 'siswa'
      }]
    });

    if (!rapot) {
      return res.status(404).json({ message: 'Rapot not found' });
    }

    return res.json(rapot);
  } catch (error) {
    console.error('Get rapot error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const rapot = await Rapot.findByPk(req.params.id);

    if (!rapot) {
      return res.status(404).json({ message: 'Rapot not found' });
    }

    const {
      tahun_ajaran,
      semester,
      sakit,
      izin,
      alpha,
      catatan_wali_kelas
    } = req.body;

    if (semester && !['ganjil', 'genap'].includes(semester)) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          semester: ['Semester must be either ganjil or genap']
        }
      });
    }

    if (tahun_ajaran) rapot.tahun_ajaran = tahun_ajaran;
    if (semester) rapot.semester = semester;
    if (sakit !== undefined) rapot.sakit = sakit;
    if (izin !== undefined) rapot.izin = izin;
    if (alpha !== undefined) rapot.alpha = alpha;
    if (catatan_wali_kelas !== undefined) rapot.catatan_wali_kelas = catatan_wali_kelas;

    await rapot.save();

    const rapotWithSiswa = await Rapot.findByPk(rapot.id, {
      include: [{
        model: Siswa,
        as: 'siswa'
      }]
    });

    return res.json(rapotWithSiswa);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          combination: ['Rapot for this student, tahun ajaran, and semester already exists']
        }
      });
    }
    console.error('Update rapot error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const rapot = await Rapot.findByPk(req.params.id);

    if (!rapot) {
      return res.status(404).json({ message: 'Rapot not found' });
    }

    await rapot.destroy();

    return res.json({ message: 'Rapot deleted successfully' });
  } catch (error) {
    console.error('Delete rapot error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
