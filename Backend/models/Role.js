import { DataTypes } from 'sequelize';
import sequelize from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
  }
);

Role.associate = (models) => {
  // ✅ Agregar alias 'permissions' en minúscula
  Role.hasMany(models.Permission, { 
    foreignKey: 'role_id', 
    as: 'permissions', // ✅ IMPORTANTE: agregar esto
    onDelete: 'CASCADE' 
  });
  
  Role.hasMany(models.User, { 
    foreignKey: 'role_id',
    as: 'users' // ✅ Opcional pero recomendado
  });
};

export default Role;