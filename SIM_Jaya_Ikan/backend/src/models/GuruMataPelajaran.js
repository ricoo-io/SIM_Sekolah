import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GuruMataPelajaran = sequelize.define('GuruMataPelajaran', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_guru: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  id_mapel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mata_pelajaran',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  id_kelas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'kelas',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'guru_mata_pelajaran',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_guru', 'id_mapel', 'id_kelas']
    }
  ]
});

export default GuruMataPelajaran;
