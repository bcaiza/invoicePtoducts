import jwt from 'jsonwebtoken';


export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role_id: decoded.role_id,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message,
    });
  }
};


export const checkPermission = (module, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
      }

      const { permissions } = req.user;

      const permission = permissions.find(perm => perm.module === module);

      
      //console.log("llegue")
     // console.log('Verificando permiso para módulo:', module, 'acción:', action);
    //  console.log('Permisos del usuario:', permissions);

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: `No tienes permisos para acceder al módulo: ${module}`,
        });
      }

      const permissionField = `can_${action}`;
      if (!permission[permissionField]) {
        return res.status(403).json({
          success: false,
          message: `No tienes permiso para realizar la acción "${action}" en el módulo: ${module}`,
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message,
      });
    }
  };
};


export const checkAnyPermission = (permissionsToCheck) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
      }

      const { permissions } = req.user;

      const hasPermission = permissionsToCheck.some(({ module, action }) => {
        const permission = permissions.find(perm => perm.module === module);
        return permission && permission[`can_${action}`];
      });

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'No tienes ninguno de los permisos necesarios',
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message,
      });
    }
  };
};


export const checkAllPermissions = (permissionsToCheck) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
      }

      const { permissions } = req.user;

      const hasAllPermissions = permissionsToCheck.every(({ module, action }) => {
        const permission = permissions.find(perm => perm.module === module);
        return permission && permission[`can_${action}`];
      });

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'No tienes todos los permisos necesarios',
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message,
      });
    }
  };
};


export const hasPermission = (req, module, action) => {
  if (!req.user || !req.user.permissions) {
    return false;
  }

  const permission = req.user.permissions.find(perm => perm.module === module);
  return permission && permission[`can_${action}`];
};


export const getUserPermissions = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user_id: req.user.id,
        email: req.user.email,
        role_id: req.user.role_id,
        permissions: req.user.permissions,
      },
    });
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener permisos',
      error: error.message,
    });
  }
};