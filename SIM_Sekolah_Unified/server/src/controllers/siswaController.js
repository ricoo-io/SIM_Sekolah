import { Siswa, Kelas } from '../models/index.js';

export const index = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get siswa error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
    const { nis, nama, alamat, ibu, ayah, wali, kontak_wali, id_kelas } = req.body;

    const errors = {};
    if (!nis) errors.nis = ['NIS is required'];
    if (!nama) errors.nama = ['Nama is required'];
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
        errors: {
          nis: ['NIS already exists']
        }
      });
    }

    const siswa = await Siswa.create({
      nis, nama, alamat, ibu, ayah, wali, kontak_wali, id_kelas
    });

    const siswaWithKelas = await Siswa.findByPk(siswa.id, {
      include: [{
        model: Kelas,
        as: 'kelas'
      }]
    });

    return res.status(201).json(siswaWithKelas);
  } catch (error) {
    console.error('Create siswa error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get siswa error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const siswa = await Siswa.findByPk(req.params.id);

    if (!siswa) {
      return res.status(404).json({ message: 'Siswa not found' });
    }

    const { nis, nama, alamat, ibu, ayah, wali, kontak_wali, id_kelas } = req.body;

    if (nis && nis !== siswa.nis) {
      const existingSiswa = await Siswa.findOne({ where: { nis } });
      if (existingSiswa) {
        return res.status(422).json({
          message: 'Validation error',
          errors: {
            nis: ['NIS already exists']
          }
        });
      }
    }

    if (nis) siswa.nis = nis;
    if (nama) siswa.nama = nama;
    if (alamat) siswa.alamat = alamat;
    if (ibu) siswa.ibu = ibu;
    if (ayah) siswa.ayah = ayah;
    if (wali) siswa.wali = wali;
    if (kontak_wali) siswa.kontak_wali = kontak_wali;
    if (id_kelas) siswa.id_kelas = id_kelas;

    await siswa.save();

    const siswaWithKelas = await Siswa.findByPk(siswa.id, {
      include: [{
        model: Kelas,
        as: 'kelas'
      }]
    });

    return res.json(siswaWithKelas);
  } catch (error) {
    console.error('Update siswa error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const siswa = await Siswa.findByPk(req.params.id);

    if (!siswa) {
      return res.status(404).json({ message: 'Siswa not found' });
    }

    await siswa.destroy();

    return res.json({ message: 'Siswa deleted successfully' });
  } catch (error) {
    console.error('Delete siswa error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
