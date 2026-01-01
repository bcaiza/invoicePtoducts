import Role from '../../models/Role.js';
import Permission from '../../models/Permission.js';

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ 
      include: [{
        model: Permission,
        as: 'permissions' // ✅ Agregar alias
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles', error: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id, { 
      include: [{
        model: Permission,
        as: 'permissions' // ✅ Agregar alias
      }]
    });

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el rol', error: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre del rol es requerido' });
    }

    const existingRole = await Role.findOne({ where: { name } });
    
    if (existingRole) {
      return res.status(400).json({ message: 'El rol ya existe' });
    }

    const role = await Role.create(
      { 
        name,
        description,
        permissions: permissions || [] // ✅ Cambiar de Permissions a permissions (minúscula)
      },
      { 
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Agregar alias
        }]
      }
    );

    const createdRole = await Role.findByPk(role.id, { 
      include: [{
        model: Permission,
        as: 'permissions' // ✅ Agregar alias
      }]
    });

    res.status(201).json(createdRole);
  } catch (error) {
    console.error('Error al crear el rol:', error);
    res.status(500).json({ 
      message: 'Error al crear el rol', 
      error: error.message 
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
      }
    }

    await role.update({ 
      name: name || role.name, 
      description: description !== undefined ? description : role.description 
    });

    if (permissions) {
      await Permission.destroy({ where: { role_id: id } });
      
      if (permissions.length > 0) {
        await Permission.bulkCreate(
          permissions.map(perm => ({ ...perm, role_id: id }))
        );
      }
    }

    const updatedRole = await Role.findByPk(id, { 
      include: [{
        model: Permission,
        as: 'permissions' // ✅ Agregar alias
      }]
    });

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.destroy();

    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el rol', error: error.message });
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    const permissions = await Permission.findAll({ 
      where: { role_id: id } 
    });

    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos', error: error.message });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await Permission.destroy({ where: { role_id: id } });

    if (permissions && permissions.length > 0) {
      await Permission.bulkCreate(
        permissions.map(perm => ({ ...perm, role_id: id }))
      );
    }

    const updatedPermissions = await Permission.findAll({ 
      where: { role_id: id } 
    });

    res.json(updatedPermissions);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar permisos', error: error.message });
  }
};