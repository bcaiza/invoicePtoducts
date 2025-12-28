import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductRecipe = sequelize.define('ProductRecipe', {
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
  raw_material_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'raw_materials',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
    comment: 'Cantidad de materia prima necesaria'
  },
  yield_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Cantidad de productos que se obtienen con esta receta'
  }
}, {
  tableName: 'product_recipes',
  timestamps: true
});

export default ProductRecipe;