import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  updateStock,
  getLowStockProducts,
  getProductStats,
  bulkUpdateStock
} from '../controllers/productController.js';

const router = express.Router();

router.get('/stats', getProductStats);
router.get('/low-stock', getLowStockProducts);
router.post('/bulk-stock', bulkUpdateStock);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.patch('/:id/toggle-status', toggleProductStatus);
router.patch('/:id/stock', updateStock);

export default router;