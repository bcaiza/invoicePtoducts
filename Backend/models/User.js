import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // ✅ AGREGAR ESTE CAMPO
    role_id: {
      type: DataTypes.UUID,
      allowNull: true, // o false si quieres que sea obligatorio
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

User.associate = (models) => {
  User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  User.hasMany(models.Invoice, { foreignKey: 'user_id', as: 'invoices' });
  User.hasMany(models.Production, { foreignKey: 'user_id', as: 'productions' });
};

export default User;