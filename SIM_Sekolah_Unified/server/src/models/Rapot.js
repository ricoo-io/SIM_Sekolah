import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Rapot = sequelize.define('Rapot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_siswa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'siswa',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  tahun_ajaran: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.ENUM('ganjil', 'genap'),
    allowNull: false
  },
  sakit: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  izin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  alpha: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  catatan_wali_kelas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'rapot',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_siswa', 'tahun_ajaran', 'semester']
    }
  ]
});

export default Rapot;
