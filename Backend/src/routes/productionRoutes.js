import express from 'express';
import {
  createProduction,
  completeProduction,
  getProductions,
  getProductionById,
  cancelProduction,
  updateProduction,
  deleteProduction,
  getProductionStats
} from '../controllers/productionController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Estadísticas
router.get('/stats', 
  authenticate, 
  checkPermission('production', 'view'),
  getProductionStats
);

// Listar producciones (con filtros)
router.get('/', 
  authenticate, 
  checkPermission('production', 'view'),
  getProductions
);

// Ver producción específica
router.get('/:productionId', 
  authenticate, 
  checkPermission('production', 'view'),
  getProductionById
);

// Crear nueva producción
router.post('/', 
  authenticate, 
  checkPermission('production', 'create'),
  createProduction
);

// Finalizar producción (actualiza stock)
router.post('/:productionId/complete', 
  authenticate, 
  checkPermission('production', 'edit'),
  completeProduction
);

// Actualizar producción (solo en proceso)
router.patch('/:productionId', 
  authenticate, 
  checkPermission('production', 'edit'),
  updateProduction
);

// Cancelar producción
router.patch('/:productionId/cancel', 
  authenticate, 
  checkPermission('production', 'edit'),
  cancelProduction
);

// Eliminar producción
router.delete('/:productionId', 
  authenticate, 
  checkPermission('production', 'delete'),
  deleteProduction
);

export default router;