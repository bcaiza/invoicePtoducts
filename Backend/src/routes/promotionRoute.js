import express from 'express';
import {
  getPromotions,
  getActivePromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
} from '../controllers/promotionController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();


router.get('/', 
  authenticate, 
  checkPermission('promotions', 'view'),
  getPromotions
);
router.get('/active', 
  authenticate, 
  checkPermission('promotions', 'view'),
  getActivePromotions
);
router.get('/:id', 
  authenticate, 
  checkPermission('promotions', 'view'),
  getPromotionById
);
router.post('/', 
  authenticate, 
  checkPermission('promotions', 'create'),
  createPromotion
);
router.put('/:id', 
  authenticate, 
  checkPermission('promotions', 'edit'),
  updatePromotion
);
router.delete('/:id', 
  authenticate, 
  checkPermission('promotions', 'delete'),
  deletePromotion
);

export default router;