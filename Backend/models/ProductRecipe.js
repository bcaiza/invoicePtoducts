import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Recipe = sequelize.define(
  "Recipe",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      comment: "Producto que se fabrica",
    },
    raw_material_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "raw_materials",
        key: "id",
      },
      comment: "Materia prima necesaria para fabricar el producto",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notas o instrucciones especiales para esta materia prima",
    },
    expected_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      comment: "Cantidad de unidades del producto que se espera producir",
      validate: {
        min: {
          args: [0],
          msg: "La cantidad esperada debe ser mayor a 0",
        },
      },
    },
  },
  {
    tableName: "recipes",
    timestamps: true,
    indexes: [
      {
        fields: ["product_id"],
      },
      {
        fields: ["raw_material_id"],
      },
      {
        unique: true,
        fields: ["product_id", "raw_material_id"],
        name: "unique_product_raw_material",
      },
    ],
  }
);

Recipe.associate = (models) => {
  Recipe.belongsTo(models.Product, {
    foreignKey: "product_id",
    as: "product",
  });

  Recipe.belongsTo(models.RawMaterial, {
    foreignKey: "raw_material_id",
    as: "rawMaterial",
  });
};

export default Recipe;
