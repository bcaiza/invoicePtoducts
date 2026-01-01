import express from 'express';
import {
  getProductRecipe,
  saveRecipe,
  addRawMaterialToRecipe,
  updateRecipeNotes,
  removeRawMaterialFromRecipe,
  getAllRecipes,
  deleteRecipe,
  getRecipeStats
} from '../controllers/recipeController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();


router.get('/stats', 
  authenticate, 
  checkPermission('recipes', 'view'),
  getRecipeStats
);

router.get('/', 
  authenticate, 
  checkPermission('recipes', 'view'),
  getAllRecipes
);

router.get('/product/:productId', 
  authenticate, 
  checkPermission('recipes', 'view'),
  getProductRecipe
);

router.post('/', 
  authenticate, 
  checkPermission('recipes', 'create'),
  saveRecipe
);

router.post('/add-material', 
  authenticate, 
  checkPermission('recipes', 'edit'),
  addRawMaterialToRecipe
);

router.patch('/:recipeId/notes', 
  authenticate, 
  checkPermission('recipes', 'edit'),
  updateRecipeNotes
);

router.delete('/product/:productId/material/:rawMaterialId', 
  authenticate, 
  checkPermission('recipes', 'edit'),
  removeRawMaterialFromRecipe
);

router.delete('/product/:productId', 
  authenticate, 
  checkPermission('recipes', 'delete'),
  deleteRecipe
);

export default router;