import User from './User.js';
import Kelas from './Kelas.js';
import Siswa from './Siswa.js';
import MataPelajaran from './MataPelajaran.js';
import GuruMataPelajaran from './GuruMataPelajaran.js';
import Penilaian from './Penilaian.js';
import Rapot from './Rapot.js';

// User - Kelas (One to Many)
User.hasMany(Kelas, { foreignKey: 'id_guru', as: 'kelas' });
Kelas.belongsTo(User, { foreignKey: 'id_guru', as: 'wali_kelas' });

// Kelas - Siswa (One to Many)
Kelas.hasMany(Siswa, { foreignKey: 'id_kelas', as: 'siswa' });
Siswa.belongsTo(Kelas, { foreignKey: 'id_kelas', as: 'kelas' });

// User - GuruMataPelajaran (One to Many)
User.hasMany(GuruMataPelajaran, { foreignKey: 'id_guru', as: 'guru_mapel' });
GuruMataPelajaran.belongsTo(User, { foreignKey: 'id_guru', as: 'guru' });

// GuruMataPelajaran - MataPelajaran (One to Many)
MataPelajaran.hasMany(GuruMataPelajaran, { foreignKey: 'id_mapel', as: 'guru_mapel' });
GuruMataPelajaran.belongsTo(MataPelajaran, { foreignKey: 'id_mapel', as: 'mapel' });

// GuruMataPelajaran - Kelas (One to Many)
Kelas.hasMany(GuruMataPelajaran, { foreignKey: 'id_kelas', as: 'guru_mapel' });
GuruMataPelajaran.belongsTo(Kelas, { foreignKey: 'id_kelas', as: 'kelas' });

// Siswa - Penilaian (One to Many)
Siswa.hasMany(Penilaian, { foreignKey: 'id_siswa', as: 'penilaian' });
Penilaian.belongsTo(Siswa, { foreignKey: 'id_siswa', as: 'siswa' });

// MataPelajaran - Penilaian (One to Many)
MataPelajaran.hasMany(Penilaian, { foreignKey: 'id_mapel', as: 'penilaian' });
Penilaian.belongsTo(MataPelajaran, { foreignKey: 'id_mapel', as: 'mapel' });

// User - Penilaian (One to Many)
User.hasMany(Penilaian, { foreignKey: 'id_guru', as: 'penilaian' });
Penilaian.belongsTo(User, { foreignKey: 'id_guru', as: 'guru' });

// Siswa - Rapot (One to Many)
Siswa.hasMany(Rapot, { foreignKey: 'id_siswa', as: 'rapot' });
Rapot.belongsTo(Siswa, { foreignKey: 'id_siswa', as: 'siswa' });

export {
  User,
  Kelas,
  Siswa,
  MataPelajaran,
  GuruMataPelajaran,
  Penilaian,
  Rapot
};
