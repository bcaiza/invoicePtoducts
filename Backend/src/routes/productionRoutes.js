import express from 'express';
import {
  createProduction,
  getProductions
} from '../controllers/productionController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', authenticate, checkPermission('production', 'view'), getProductions);
router.post('/', authenticate, checkPermission('production', 'create'), createProduction);

export default router;