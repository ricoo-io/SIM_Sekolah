import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nip: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'guru'),
    defaultValue: 'guru',
    allowNull: false
  },
  wali_kelas: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },

}, {
  tableName: 'users',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default User;
