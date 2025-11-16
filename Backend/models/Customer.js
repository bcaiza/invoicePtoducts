import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Customer = sequelize.define(
  'Customer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    identification_type: {
      type: DataTypes.ENUM('document_id', 'ruc', 'passport', 'final_consumer'),
      allowNull: false,
      defaultValue: 'document_id',
    },
    identification: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'customers',
    timestamps: true,
  }
);

Customer.associate = (models) => {
  Customer.hasMany(models.Invoice, {
    foreignKey: 'customer_id',
    as: 'invoices',
  });
};




export default Customer;