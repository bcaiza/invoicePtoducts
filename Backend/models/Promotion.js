import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Promotion = sequelize.define(
  'Promotion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es requerido' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    
    promotion_type: {
      type: DataTypes.ENUM('buy_x_get_y', 'percentage_discount', 'fixed_discount'),
      allowNull: false,
      comment: 'Tipo: compra X lleva Y, descuento %, descuento fijo',
    },
    buy_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Cantidad a comprar (para buy_x_get_y)',
    },
    get_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Cantidad gratis (para buy_x_get_y)',
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Porcentaje de descuento',
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monto fijo de descuento',
    },
    min_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Cantidad mínima para aplicar promoción',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
     unit_id: {  
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'units',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      comment: 'Unidad en la que aplica la promoción',
    },
  },
  {
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Promotion.prototype.isValid = function() {
  if (!this.active) return false;
  
  const now = new Date();
  
  if (this.start_date && now < new Date(this.start_date)) {
    return false;
  }
  
  if (this.end_date && now > new Date(this.end_date)) {
    return false;
  }
  
  return true;
};

Promotion.prototype.calculateBenefit = function(quantity, unitPrice) {
  if (!this.isValid()) return { bonus: 0, discount: 0 };
  
  switch (this.promotion_type) {
    case 'buy_x_get_y':
      const sets = Math.floor(quantity / this.buy_quantity);
      const bonus = sets * this.get_quantity;
      return { bonus, discount: 0, totalQuantity: quantity + bonus };
      
    case 'percentage_discount':
      if (quantity >= this.min_quantity) {
        const discount = (unitPrice * quantity * this.discount_percentage) / 100;
        return { bonus: 0, discount, totalQuantity: quantity };
      }
      return { bonus: 0, discount: 0, totalQuantity: quantity };
      
    case 'fixed_discount':
      if (quantity >= this.min_quantity) {
        return { bonus: 0, discount: this.discount_amount, totalQuantity: quantity };
      }
      return { bonus: 0, discount: 0, totalQuantity: quantity };
      
    default:
      return { bonus: 0, discount: 0, totalQuantity: quantity };
  }
};

Promotion.associate = (models) => {
  Promotion.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
  });

   Promotion.belongsTo(models.Unit, {  
    foreignKey: 'unit_id',
    as: 'unit',
  });
};



export default Promotion;