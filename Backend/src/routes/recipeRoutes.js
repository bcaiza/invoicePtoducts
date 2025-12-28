import express from 'express';
import {
  getProductRecipe,
  createOrUpdateRecipe,
  deleteRecipeIngredient
} from '../controllers/recipeController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/product/:productId', authenticate, checkPermission('products', 'view'), getProductRecipe);
router.post('/', authenticate, checkPermission('products', 'edit'), createOrUpdateRecipe);
router.delete('/:id', authenticate, checkPermission('products', 'edit'), deleteRecipeIngredient);

export default router;