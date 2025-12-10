import { GuruMataPelajaran, User, MataPelajaran, Kelas } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllGuruMapel = asyncHandler(async (req, res) => {
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
});

export const addGuruMapel = asyncHandler(async (req, res) => {
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
});

export const getGuruMapelById = asyncHandler(async (req, res) => {
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
});

export const updateGuruMapel = asyncHandler(async (req, res) => {
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
});

export const deleteGuruMapel = asyncHandler(async (req, res) => {
  const guruMapel = await GuruMataPelajaran.findByPk(req.params.id);

  if (!guruMapel) {
    return res.status(404).json({ message: 'Guru mata pelajaran not found' });
  }

  await guruMapel.destroy();

  return res.json({ message: 'Guru mata pelajaran deleted successfully' });
});
