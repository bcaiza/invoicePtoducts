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
    },
    comment: 'Producto a fabricar'
  },
  expected_quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    validate: {
      min: 0.0001
    },
    comment: 'Cantidad esperada a producir'
  },
  produced_quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0
    },
    comment: 'Cantidad realmente producida - ALIMENTA EL STOCK al finalizar'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuario que registró la producción'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas u observaciones'
  },
  status: {
    type: DataTypes.ENUM('in_process', 'completed', 'cancelled'),
    defaultValue: 'in_process',
    allowNull: false
  },
  production_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de inicio'
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de finalización'
  }
}, {
  tableName: 'productions',
  timestamps: true,
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['production_date']
    }
  ]
});

Production.associate = (models) => {
  Production.belongsTo(models.Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
  });
  
  Production.belongsTo(models.User, { 
    foreignKey: 'user_id', 
    as: 'user' 
  });
};

export default Production;