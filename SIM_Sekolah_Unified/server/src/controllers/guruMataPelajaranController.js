import { GuruMataPelajaran, User, MataPelajaran, Kelas } from '../models/index.js';

export const index = async (req, res) => {
  try {
    const whereClause = {};
    
    if (req.query.guru) {
      whereClause.id_guru = req.query.guru;
    }
    
    const guruMapel = await GuruMataPelajaran.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: Kelas,
          as: 'kelas'
        }
      ]
    });
    return res.json(guruMapel);
  } catch (error) {
    console.error('Get guru mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
    const { id_guru, id_mapel, id_kelas } = req.body;

    if (!id_guru || !id_mapel || !id_kelas) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          id_guru: !id_guru ? ['Guru is required'] : [],
          id_mapel: !id_mapel ? ['Mata pelajaran is required'] : [],
          id_kelas: !id_kelas ? ['Kelas is required'] : []
        }
      });
    }

    const guruMapel = await GuruMataPelajaran.create({
      id_guru,
      id_mapel,
      id_kelas
    });

    const guruMapelWithRelations = await GuruMataPelajaran.findByPk(guruMapel.id, {
      include: [
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: Kelas,
          as: 'kelas'
        }
      ]
    });

    return res.status(201).json(guruMapelWithRelations);
  } catch (error) {
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          combination: ['This combination of guru, mata pelajaran, and kelas already exists']
        }
      });
    }
    console.error('Create guru mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
    const guruMapel = await GuruMataPelajaran.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: Kelas,
          as: 'kelas'
        }
      ]
    });

    if (!guruMapel) {
      return res.status(404).json({ message: 'Guru mata pelajaran not found' });
    }

    return res.json(guruMapel);
  } catch (error) {
    console.error('Get guru mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const guruMapel = await GuruMataPelajaran.findByPk(req.params.id);

    if (!guruMapel) {
      return res.status(404).json({ message: 'Guru mata pelajaran not found' });
    }

    const { id_guru, id_mapel, id_kelas } = req.body;

    if (id_guru) guruMapel.id_guru = id_guru;
    if (id_mapel) guruMapel.id_mapel = id_mapel;
    if (id_kelas) guruMapel.id_kelas = id_kelas;

    await guruMapel.save();

    const guruMapelWithRelations = await GuruMataPelajaran.findByPk(guruMapel.id, {
      include: [
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: Kelas,
          as: 'kelas'
        }
      ]
    });

    return res.json(guruMapelWithRelations);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          combination: ['This combination of guru, mata pelajaran, and kelas already exists']
        }
      });
    }
    console.error('Update guru mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const guruMapel = await GuruMataPelajaran.findByPk(req.params.id);

    if (!guruMapel) {
      return res.status(404).json({ message: 'Guru mata pelajaran not found' });
    }

    await guruMapel.destroy();

    return res.json({ message: 'Guru mata pelajaran deleted successfully' });
  } catch (error) {
    console.error('Delete guru mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
