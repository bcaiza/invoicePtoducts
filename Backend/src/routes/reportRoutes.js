import express from 'express';
import {
  getSalesByPeriod,
  getTopSellingProducts,
  getInvoiceDetails,
  getSalesByCustomer,
  getDailySalesSummary,
  getSalesByPaymentMethod,
  getProductInventoryReport,
  getInvoiceProductsDetail
} from '../controllers/reportController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();


router.get('/sales', 
  authenticate, 
  checkPermission('reports', 'view'),
  getSalesByPeriod
);


router.get('/top-products', 
  authenticate, 
  checkPermission('reports', 'view'),
  getTopSellingProducts
);


router.get('/invoice/:invoice_id', 
  authenticate, 
  checkPermission('reports', 'view'),
  getInvoiceDetails
);


router.get('/customers', 
  authenticate, 
  checkPermission('reports', 'view'),
  getSalesByCustomer
);


router.get('/daily', 
  authenticate, 
  checkPermission('reports', 'view'),
  getDailySalesSummary
);


router.get('/payment-methods', 
  authenticate, 
  checkPermission('reports', 'view'),
  getSalesByPaymentMethod
);


router.get('/inventory', 
  authenticate, 
  checkPermission('reports', 'view'),
  getProductInventoryReport
);

router.get('/invoice-products', 
  authenticate, 
  checkPermission('reports', 'view'),
  getInvoiceProductsDetail
);

export default router;