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

const router = express.Router();

// 📊 REPORTE 1: Ventas por período
// GET /api/reports/sales
// Query params: start_date, end_date, customer_id (opcionales)
router.get('/sales', getSalesByPeriod);

// 📈 REPORTE 2: Productos más vendidos
// GET /api/reports/top-products
// Query params: start_date, end_date, limit (opcionales)
router.get('/top-products', getTopSellingProducts);

// 🧾 REPORTE 3: Detalle completo de una factura
// GET /api/reports/invoice/:invoice_id
router.get('/invoice/:invoice_id', getInvoiceDetails);

// 👥 REPORTE 4: Ventas por cliente
// GET /api/reports/customers
// Query params: start_date, end_date (opcionales)
router.get('/customers', getSalesByCustomer);

// 📅 REPORTE 5: Resumen diario de ventas
// GET /api/reports/daily
// Query params: start_date, end_date (opcionales)
router.get('/daily', getDailySalesSummary);

// 💰 REPORTE 6: Ventas por forma de pago
// GET /api/reports/payment-methods
// Query params: start_date, end_date (opcionales)
router.get('/payment-methods', getSalesByPaymentMethod);

// 📦 REPORTE 7: Inventario y ventas de productos
// GET /api/reports/inventory
// Query params: low_stock_threshold (opcional, default: 10)
router.get('/inventory', getProductInventoryReport);

router.get('/invoice-products', getInvoiceProductsDetail);

export default router;