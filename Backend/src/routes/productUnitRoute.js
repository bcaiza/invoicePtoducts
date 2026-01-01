import express from 'express';
import {
  getProductUnits,
  getProductUnitById,
  getProductUnitsByProduct,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
  bulkCreateProductUnits
} from '../controllers/productUnitController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();


router.get('/', 
  authenticate, 
  checkPermission('product_units', 'view'),
  getProductUnits
);
router.get('/:id', 
  authenticate, 
  checkPermission('product_units', 'view'),
  getProductUnitById
);
router.get('/product/:productId', 
  authenticate, 
  checkPermission('product_units', 'view'),
  getProductUnitsByProduct
);
router.post('/', 
  authenticate, 
  checkPermission('product_units', 'create'),
  createProductUnit
);
router.post('/bulk', 
  authenticate, 
  checkPermission('product_units', 'create'),
  bulkCreateProductUnits
);
router.put('/:id', 
  authenticate, 
  checkPermission('product_units', 'edit'),
  updateProductUnit
);
router.delete('/:id', 
  authenticate, 
  checkPermission('product_units', 'delete'),
  deleteProductUnit
);

export default router;
