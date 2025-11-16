import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  getInvoicesByCustomer,
  getInvoiceStats
} from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/stats', getInvoiceStats);
router.get('/customer/:customer_id', getInvoicesByCustomer);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

router.patch('/:id/status', updateInvoiceStatus);

export default router;