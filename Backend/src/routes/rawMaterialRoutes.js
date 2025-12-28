import express from 'express';
import {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  updateStock,
  getLowStock
} from '../controllers/rawMaterialController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('raw_materials', 'view'), getRawMaterials);
router.post('/', authenticate, checkPermission('raw_materials', 'create'), createRawMaterial);
router.put('/:id', authenticate, checkPermission('raw_materials', 'edit'), updateRawMaterial);
router.patch('/:id/stock', authenticate, checkPermission('raw_materials', 'edit'), updateStock);
router.get('/low-stock', authenticate, checkPermission('raw_materials', 'view'), getLowStock);

export default router;