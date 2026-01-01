import { DataTypes } from "sequelize";
import sequelize from "../src/config/database.js";
import { v4 as uuidv4 } from "uuid";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pvp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Weight in kg",
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

Product.associate = (models) => {
  Product.belongsTo(models.Unit, { foreignKey: 'base_unit_id', as: 'baseUnit' });
  Product.hasMany(models.ProductUnit, { foreignKey: 'product_id', as: 'ProductUnits' });
  Product.hasMany(models.InvoiceDetail, { foreignKey: 'product_id', as: 'invoiceDetails' });
  Product.hasMany(models.ProductRecipe, { foreignKey: 'product_id', as: 'recipes' });
  Product.hasMany(models.Production, { foreignKey: 'product_id', as: 'productions' });
  Product.hasMany(models.Promotion, { foreignKey: 'product_id', as: 'promotions' });
};

export default Product;