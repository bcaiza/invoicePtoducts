import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Invoice = sequelize.define(
  'Invoice',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'transfer', 'credit'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'invoices',
    timestamps: true,
  }
);

Invoice.associate = (models) => {
  Invoice.belongsTo(models.Customer, {
    foreignKey: 'customer_id',
    as: 'customer',
  });
  Invoice.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
  });
  Invoice.hasMany(models.InvoiceDetail, {
    foreignKey: 'invoice_id',
    as: 'details',
    onDelete: 'CASCADE',
  });
};

export default Invoice;