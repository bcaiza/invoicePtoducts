import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RawMaterial = sequelize.define('RawMaterial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  unit_of_measure: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'kg, litros, unidades, etc.'
  },
  stock: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
    allowNull: false
  },
  min_stock: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0,
    comment: 'Stock mínimo para alerta'
  },
  unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Costo por unidad'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'raw_materials',
  timestamps: true
});

RawMaterial.associate = (models) => {
  RawMaterial.hasMany(models.ProductRecipe, { 
    foreignKey: 'raw_material_id', 
    as: 'recipes' 
  });
};

export default RawMaterial;