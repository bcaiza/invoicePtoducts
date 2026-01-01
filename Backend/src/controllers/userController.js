import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Permission from '../../models/Permission.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      include: {
        model: Role,
        as: 'role', // ✅ Agregar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      },
      attributes: { exclude: ['password'] }, 
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { 
      include: {
        model: Role,
        as: 'role', // ✅ Agregar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id, active } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son requeridos' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    if (role_id) {
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({ message: 'El rol especificado no existe' });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      name, 
      email, 
      password: hashed, 
      role_id,
      active: active !== undefined ? active : true
    });

    const createdUser = await User.findByPk(user.id, {
      include: {
        model: Role,
        as: 'role', // ✅ Agregar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      },
      attributes: { exclude: ['password'] }
    });

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id, active } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }

    if (role_id) {
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({ message: 'El rol especificado no existe' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role_id: role_id !== undefined ? role_id : user.role_id,
      active: active !== undefined ? active : user.active
    });

    const updatedUser = await User.findByPk(id, {
      include: {
        model: Role,
        as: 'role', // ✅ Agregar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      },
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Nueva contraseña es requerida' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    res.json({ message: 'Contraseña reseteada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al resetear la contraseña', error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ active: !user.active });

    const updatedUser = await User.findByPk(id, {
      include: {
        model: Role,
        as: 'role' // ✅ Agregar alias
      },
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado del usuario', error: error.message });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    const users = await User.findAll({
      where: { role_id: roleId },
      include: {
        model: Role,
        as: 'role' // ✅ Agregar alias
      },
      attributes: { exclude: ['password'] }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios por rol', error: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { active: true },
      include: {
        model: Role,
        as: 'role', // ✅ Agregar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      },
      attributes: { exclude: ['password'] }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios activos', error: error.message });
  }
};