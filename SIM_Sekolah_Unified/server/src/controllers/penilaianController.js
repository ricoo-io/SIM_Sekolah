import { Penilaian, Siswa, MataPelajaran, User, Kelas } from '../models/index.js';
import { Op } from 'sequelize';

export const index = async (req, res) => {
  try {
    const { mapel, kelas, siswa } = req.query;
    
    const whereClause = {};
    const siswaWhereClause = {};

    if (mapel) {
      whereClause.id_mapel = mapel;
    }

    if (siswa) {
      whereClause.id_siswa = siswa;
    }

    if (kelas) {
      siswaWhereClause.id_kelas = kelas;
    }

    const penilaian = await Penilaian.findAll({
      where: whereClause,
      include: [
        {
          model: Siswa,
          as: 'siswa',
          where: Object.keys(siswaWhereClause).length > 0 ? siswaWhereClause : undefined,
          include: [{
            model: Kelas,
            as: 'kelas'
          }]
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    return res.json(penilaian);
  } catch (error) {
    console.error('Get penilaian error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
    const {
      id_siswa,
      id_mapel,
      id_guru,
      semester,
      nilai_harian_1,
      nilai_harian_2,
      nilai_harian_3,
      nilai_UTS,
      nilai_harian_4,
      nilai_harian_5,
      nilai_harian_6,
      nilai_UAS,
      nilai_Akhir
    } = req.body;

    if (!id_siswa || !id_mapel || !id_guru || !semester) {
      return res.status(422).json({
        message: 'Validation error',
        errors: {
          id_siswa: !id_siswa ? ['Siswa is required'] : [],
          id_mapel: !id_mapel ? ['Mata pelajaran is required'] : [],
          id_guru: !id_guru ? ['Guru is required'] : [],
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

    const [penilaian, created] = await Penilaian.findOrCreate({
      where: {
        id_siswa,
        id_mapel,
        semester
      },
      defaults: {
        id_guru,
        nilai_harian_1,
        nilai_harian_2,
        nilai_harian_3,
        nilai_UTS,
        nilai_harian_4,
        nilai_harian_5,
        nilai_harian_6,
        nilai_UAS,
        nilai_Akhir,
        update_terakhir: new Date()
      }
    });

    if (!created) {
      await penilaian.update({
        id_guru,
        nilai_harian_1,
        nilai_harian_2,
        nilai_harian_3,
        nilai_UTS,
        nilai_harian_4,
        nilai_harian_5,
        nilai_harian_6,
        nilai_UAS,
        nilai_Akhir,
        update_terakhir: new Date()
      });
    }

    const penilaianWithRelations = await Penilaian.findByPk(penilaian.id, {
      include: [
        {
          model: Siswa,
          as: 'siswa'
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    return res.status(201).json(penilaianWithRelations);
  } catch (error) {
    console.error('Create penilaian error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
    const penilaian = await Penilaian.findByPk(req.params.id, {
      include: [
        {
          model: Siswa,
          as: 'siswa'
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!penilaian) {
      return res.status(404).json({ message: 'Penilaian not found' });
    }

    return res.json(penilaian);
  } catch (error) {
    console.error('Get penilaian error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const penilaian = await Penilaian.findByPk(req.params.id);

    if (!penilaian) {
      return res.status(404).json({ message: 'Penilaian not found' });
    }

    const {
      nilai_harian_1,
      nilai_harian_2,
      nilai_harian_3,
      nilai_UTS,
      nilai_harian_4,
      nilai_harian_5,
      nilai_harian_6,
      nilai_UAS,
      nilai_Akhir
    } = req.body;

    if (nilai_harian_1 !== undefined) penilaian.nilai_harian_1 = nilai_harian_1;
    if (nilai_harian_2 !== undefined) penilaian.nilai_harian_2 = nilai_harian_2;
    if (nilai_harian_3 !== undefined) penilaian.nilai_harian_3 = nilai_harian_3;
    if (nilai_UTS !== undefined) penilaian.nilai_UTS = nilai_UTS;
    if (nilai_harian_4 !== undefined) penilaian.nilai_harian_4 = nilai_harian_4;
    if (nilai_harian_5 !== undefined) penilaian.nilai_harian_5 = nilai_harian_5;
    if (nilai_harian_6 !== undefined) penilaian.nilai_harian_6 = nilai_harian_6;
    if (nilai_UAS !== undefined) penilaian.nilai_UAS = nilai_UAS;
    if (nilai_Akhir !== undefined) penilaian.nilai_Akhir = nilai_Akhir;

    penilaian.update_terakhir = new Date();

    await penilaian.save();

    const penilaianWithRelations = await Penilaian.findByPk(penilaian.id, {
      include: [
        {
          model: Siswa,
          as: 'siswa'
        },
        {
          model: MataPelajaran,
          as: 'mapel'
        },
        {
          model: User,
          as: 'guru',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    return res.json(penilaianWithRelations);
  } catch (error) {
    console.error('Update penilaian error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const penilaian = await Penilaian.findByPk(req.params.id);

    if (!penilaian) {
      return res.status(404).json({ message: 'Penilaian not found' });
    }

    await penilaian.destroy();

    return res.json({ message: 'Penilaian deleted successfully' });
  } catch (error) {
    console.error('Delete penilaian error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
