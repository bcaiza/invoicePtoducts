import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Unit = sequelize.define(
  'Unit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre es requerido' },
        len: {
          args: [2, 50],
          msg: 'El nombre debe tener entre 2 y 50 caracteres',
        },
      },
    },
    abbreviation: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'La abreviación es requerida' },
        len: {
          args: [1, 10],
          msg: 'La abreviación debe tener entre 1 y 10 caracteres',
        },
      },
    },
    type: {
      type: DataTypes.ENUM('weight', 'volume', 'length', 'unit', 'package'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El tipo es requerido' },
      },
    },
    base_unit: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Unidad base para conversiones (ej: "g" para peso, "ml" para volumen)',
    },
    conversion_factor: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'El factor de conversión debe ser positivo' },
      },
      comment: 'Factor de conversión a la unidad base (ej: 1 kg = 1000 g)',
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'units',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Unit.prototype.toBaseUnit = function(value) {
  if (!this.conversion_factor) {
    return value; 
  }
  return value * parseFloat(this.conversion_factor);
};

Unit.prototype.fromBaseUnit = function(value) {
  if (!this.conversion_factor) {
    return value; 
  }
  return value / parseFloat(this.conversion_factor);
};

Unit.convert = async function(value, fromUnitId, toUnitId) {
  if (fromUnitId === toUnitId) {
    return value;
  }

  const fromUnit = await Unit.findByPk(fromUnitId);
  const toUnit = await Unit.findByPk(toUnitId);

  if (!fromUnit || !toUnit) {
    throw new Error('Unidad no encontrada');
  }

  if (fromUnit.type !== toUnit.type) {
    throw new Error('No se pueden convertir unidades de diferentes tipos');
  }

  const baseValue = fromUnit.toBaseUnit(value);
  
  return toUnit.fromBaseUnit(baseValue);
};


Unit.associate = (models) => {
  Unit.hasMany(models.Product, { foreignKey: 'base_unit_id', as: 'products' });
  Unit.hasMany(models.ProductUnit, { foreignKey: 'unit_id', as: 'productUnits' });
  Unit.hasMany(models.InvoiceDetail, { foreignKey: 'unit_id', as: 'invoiceDetails' });
};


export default Unit;