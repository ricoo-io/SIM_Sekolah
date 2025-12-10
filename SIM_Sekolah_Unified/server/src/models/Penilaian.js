import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Penilaian = sequelize.define('Penilaian', {
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
  id_mapel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mata_pelajaran',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  semester: {
    type: DataTypes.ENUM('ganjil', 'genap'),
    allowNull: false
  },
  nilai_harian_1: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_harian_2: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_harian_3: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_UTS: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_harian_4: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_harian_5: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_harian_6: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_UAS: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nilai_Akhir: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  update_terakhir: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'penilaian',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_siswa', 'id_mapel', 'semester']
    }
  ]
});

export default Penilaian;
