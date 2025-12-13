import { Rapot, Siswa } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllRapot = asyncHandler(async (req, res) => {
  const rapot = await Rapot.findAll({
    include: [{
      model: Siswa,
      as: 'siswa'
    }]
  });
  return res.json(rapot);
});

export const addRapot = asyncHandler(async (req, res) => {
  const {
    id_siswa,
    tahun_ajaran,
    semester,
    sakit,
    izin,
    alpha,
    catatan_wali_kelas
  } = req.body;

  if (!id_siswa || !semester) {
    return res.status(422).json({
      message: 'Validation error',
      errors: {
        id_siswa: !id_siswa ? ['Siswa is required'] : [],
        semester: !semester ? ['Semester is required'] : []
      }
    });
  }

  if (!['ganjil', 'genap'].includes(semester)) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { semester: ['Semester must be either ganjil or genap'] }
    });
  }

  const rapot = await Rapot.create({
    id_siswa,
    tahun_ajaran: tahun_ajaran || '2024/2025',
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
});

export const getRapotById = asyncHandler(async (req, res) => {
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
});

export const updateRapot = asyncHandler(async (req, res) => {
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
      errors: { semester: ['Semester must be either ganjil or genap'] }
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
});

export const deleteRapot = asyncHandler(async (req, res) => {
  const rapot = await Rapot.findByPk(req.params.id);

  if (!rapot) {
    return res.status(404).json({ message: 'Rapot not found' });
  }

  await rapot.destroy();
  return res.json({ message: 'Rapot deleted successfully' });
});
