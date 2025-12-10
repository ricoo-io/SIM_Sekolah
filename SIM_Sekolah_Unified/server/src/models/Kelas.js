import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Kelas = sequelize.define('Kelas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_guru: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  nama_kelas: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tingkat: {
    type: DataTypes.ENUM('7', '8', '9'),
    allowNull: false
  }
}, {
  tableName: 'kelas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Kelas;
