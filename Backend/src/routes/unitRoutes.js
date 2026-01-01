import express from 'express';
import {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getProductUnits,
  configureProductUnits,
  convertProductUnits,
  convertGlobalUnits,
  getProductConversionTable,
} from '../controllers/unitController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();


router.get(
  '/',
  authenticate,
  checkPermission('units', 'view'),
  getUnits
);

router.get(
  '/:id',
  authenticate,
  checkPermission('units', 'view'),
  getUnitById
);

router.post(
  '/',
  authenticate,
  checkPermission('units', 'create'),
  createUnit
);

router.put(
  '/:id',
  authenticate,
  checkPermission('units', 'edit'),
  updateUnit
);

router.delete(
  '/:id',
  authenticate,
  checkPermission('units', 'delete'),
  deleteUnit
);


router.get(
  '/product/:product_id',
  authenticate,
  checkPermission('units', 'view'),
  getProductUnits
);

router.post(
  '/product/:product_id/configure',
  authenticate,
  checkPermission('units', 'edit'),
  configureProductUnits
);

router.get(
  '/product/:product_id/conversions',
  authenticate,
  checkPermission('units', 'view'),
  getProductConversionTable
);


router.post(
  '/product/:product_id/convert',
  authenticate,
  checkPermission('units', 'edit'),
  convertProductUnits
);

router.post(
  '/convert',
  authenticate,
  checkPermission('units', 'edit'),
  convertGlobalUnits
);

export default router;