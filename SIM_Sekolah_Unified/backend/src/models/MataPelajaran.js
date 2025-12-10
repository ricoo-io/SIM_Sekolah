import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MataPelajaran = sequelize.define('MataPelajaran', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mata_pelajaran: {
    type: DataTypes.STRING,
    allowNull: false
  },
  kkm: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'mata_pelajaran',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default MataPelajaran;
