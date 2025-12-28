import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Production = sequelize.define('Production', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  expected_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad esperada a producir'
  },
  produced_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cantidad realmente producida'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'completed'
  },
  production_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'productions',
  timestamps: true
});

export default Production;