import { DataTypes } from "sequelize";
import sequelize from "../src/config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Tipo de entidad: Product, Customer, User, etc.",
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "ID de la entidad afectada",
    },
    action: {
      type: DataTypes.ENUM(
        "CREATE",
        "UPDATE",
        "DELETE",
        "STATUS_CHANGE",
        "STOCK_UPDATE"
      ),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "null para acciones automáticas del sistema",
    },
    user_email: {
      type: DataTypes.STRING,
      comment: "Email del usuario (denormalizado para histórico)",
    },
    changes: {
      type: DataTypes.JSONB,
      comment: "JSON con before y after: { before: {...}, after: {...} }",
    },
    ip_address: {
      type: DataTypes.STRING(45),
      comment: "IP desde donde se hizo la acción",
    },
    user_agent: {
      type: DataTypes.TEXT,
      comment: "Navegador/cliente utilizado",
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["entity_type", "entity_id"] },
      { fields: ["user_id"] },
      { fields: ["action"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default AuditLog;
