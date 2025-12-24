import { Siswa, Kelas } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllSiswa = asyncHandler(async (req, res) => {
  const query = {};
  
  if (req.query.kelas) {
    query.id_kelas = req.query.kelas;
  }
  
  const siswa = await Siswa.findAll({
    where: query,
    include: [{
      model: Kelas,
      as: 'kelas'
    }]
  });
  return res.json(siswa);
});

export const addSiswa = asyncHandler(async (req, res) => {
  const { nis, nama, jenis_kelamin, alamat, ibu, ayah, wali, kontak_wali, id_kelas } = req.body;

  const errors = {};
  if (!nis) errors.nis = ['NIS is required'];
  if (!nama) errors.nama = ['Nama is required'];
  if (!jenis_kelamin) errors.jenis_kelamin = ['Jenis kelamin is required'];
  if (!alamat) errors.alamat = ['Alamat is required'];
  if (!ibu) errors.ibu = ['Nama ibu is required'];
  if (!ayah) errors.ayah = ['Nama ayah is required'];
  if (!wali) errors.wali = ['Nama wali is required'];
  if (!kontak_wali) errors.kontak_wali = ['Kontak wali is required'];
  if (!id_kelas) errors.id_kelas = ['Kelas is required'];

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: 'Validation error',
      errors
    });
  }

  const existingSiswa = await Siswa.findOne({ where: { nis } });
  if (existingSiswa) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { nis: ['NIS already exists'] }
    });
  }

  const siswa = await Siswa.create({
    nis, nama, jenis_kelamin, alamat, ibu, ayah, wali, kontak_wali, id_kelas
  });

  const siswaWithKelas = await Siswa.findByPk(siswa.id, {
    include: [{
      model: Kelas,
      as: 'kelas'
    }]
  });

  return res.status(201).json(siswaWithKelas);
});

export const getSiswaById = asyncHandler(async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id, {
    include: [{
      model: Kelas,
      as: 'kelas'
    }]
  });

  if (!siswa) {
    return res.status(404).json({ message: 'Siswa not found' });
  }

  return res.json(siswa);
});

export const updateSiswa = asyncHandler(async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id);

  if (!siswa) {
    return res.status(404).json({ message: 'Siswa not found' });
  }

  const { nis, nama, jenis_kelamin, alamat, ibu, ayah, wali, kontak_wali, id_kelas } = req.body;

  if (nis && nis !== siswa.nis) {
    const existingSiswa = await Siswa.findOne({ where: { nis } });
    if (existingSiswa) {
      return res.status(422).json({
        message: 'Validation error',
        errors: { nis: ['NIS already exists'] }
      });
    }
  }

  if (nis) siswa.nis = nis;
  if (nama) siswa.nama = nama;
  if (jenis_kelamin) siswa.jenis_kelamin = jenis_kelamin;
  if (alamat) siswa.alamat = alamat;
  if (ibu) siswa.ibu = ibu;
  if (ayah) siswa.ayah = ayah;
  if (wali) siswa.wali = wali;
  if (kontak_wali) siswa.kontak_wali = kontak_wali;
  if (id_kelas !== undefined) siswa.id_kelas = id_kelas;

  await siswa.save();

  const siswaWithKelas = await Siswa.findByPk(siswa.id, {
    include: [{
      model: Kelas,
      as: 'kelas'
    }]
  });

  return res.json(siswaWithKelas);
});

export const deleteSiswa = asyncHandler(async (req, res) => {
  const siswa = await Siswa.findByPk(req.params.id);

  if (!siswa) {
    return res.status(404).json({ message: 'Siswa not found' });
  }

  await siswa.destroy();
  return res.json({ message: 'Siswa deleted successfully' });
});
