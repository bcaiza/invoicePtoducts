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
   description: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
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