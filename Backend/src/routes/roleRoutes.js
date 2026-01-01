import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions
} from '../controllers/roleController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', 
  authenticate, 
  checkPermission('roles', 'view'),
  getRoles
);

router.get('/:id/permissions', 
  authenticate, 
  checkPermission('roles', 'view'),
  getRolePermissions
);

router.get('/:id', 
  authenticate, 
  checkPermission('roles', 'view'),
  getRoleById
);

router.post('/', 
  authenticate, 
  checkPermission('roles', 'create'),
  createRole
);

router.put('/:id', 
  authenticate, 
  checkPermission('roles', 'edit'),
  updateRole
);

router.put('/:id/permissions', 
  authenticate, 
  checkPermission('roles', 'edit'),
  updateRolePermissions
);

router.delete('/:id', 
  authenticate, 
  checkPermission('users', 'delete'),
  deleteRole
);

export default router;