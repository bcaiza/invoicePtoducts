import express from 'express';
import {
  getRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} from '../controllers/rawMaterialController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', 
  authenticate, 
  checkPermission('raw_materials', 'view'),
  getRawMaterials
);
router.get('/:id', 
  authenticate, 
  checkPermission('raw_materials', 'view'),
  getRawMaterialById
);
router.post('/', 
  authenticate, 
  checkPermission('raw_materials', 'create'),
  createRawMaterial
);
router.put('/:id', 
  authenticate, 
  checkPermission('raw_materials', 'edit'),
  updateRawMaterial
);
router.delete('/:id', 
  authenticate, 
  checkPermission('raw_materials', 'delete'),
  deleteRawMaterial
);

export default router;