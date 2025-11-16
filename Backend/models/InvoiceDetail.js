import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const InvoiceDetail = sequelize.define(
  'InvoiceDetail',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    invoice_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: true, 
      comment: 'Nombre del producto al momento de la venta (opcional, se toma del producto si no se especifica)',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio unitario al momento de la venta',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'quantity * unit_price',
    },
  },
  {
    tableName: 'invoice_details',
    timestamps: true,
  }
);

InvoiceDetail.associate = (models) => {
  InvoiceDetail.belongsTo(models.Invoice, {
    foreignKey: 'invoice_id',
    as: 'invoice',
  });

  InvoiceDetail.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product',
  });
};

export default InvoiceDetail;