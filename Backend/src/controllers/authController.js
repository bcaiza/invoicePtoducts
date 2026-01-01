import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Permission from '../../models/Permission.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son requeridos' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id: role_id || null,
      active: true
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

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role_id: user.role_id,
        permissions: createdUser.role?.permissions || [] // ✅ Usar alias
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: createdUser,
      token
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      message: 'Error al registrar el usuario', 
      error: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Datos de login recibidos:", { email });

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // ✅ Corregir los includes con aliases
    const user = await User.findOne({ 
      where: { email },
      include: {
        model: Role,
        as: 'role', // ✅ Usar alias definido en el modelo
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Usar alias si está definido en Role
        }]
      }
    });

    console.log("Usuario encontrado:", user ? 'Sí' : 'No');
    console.log("Rol del usuario:", user?.role);
    console.log("Permisos del usuario:", user?.role?.permissions);

    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    if (!user.active) {
      return res.status(403).json({ 
        message: 'Usuario inactivo. Contacte al administrador' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // ✅ Usar los alias correctos
    const permissions = user.role?.permissions || [];

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role_id: user.role_id,
        permissions: permissions.map(p => ({
          module: p.module,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete
        }))
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      active: user.active,
      role: user.role, // ✅ Cambiar de Role a role
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Login exitoso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error al iniciar sesión', 
      error: error.message 
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await User.findByPk(decoded.id, {
      include: {
        model: Role,
        as: 'role', // ✅ Usar alias
        include: [{
          model: Permission,
          as: 'permissions' // ✅ Usar alias
        }]
      },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    res.json({ user });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    res.status(500).json({ 
      message: 'Error al verificar token', 
      error: error.message 
    });
  }
};