import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Siswa = sequelize.define('Siswa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nis: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ibu: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ayah: {
    type: DataTypes.STRING,
    allowNull: false
  },
  wali: {
    type: DataTypes.STRING,
    allowNull: false
  },
  kontak_wali: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id_kelas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'kelas',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'siswa',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Siswa;
