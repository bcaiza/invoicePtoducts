import express from 'express';
import { getAuditLogs, getAuditStats } from '../controllers/auditController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/audit-logs', authenticate, checkPermission('audit', 'view'), getAuditLogs);
router.get('/audit-logs/stats', authenticate, checkPermission('audit', 'view'), getAuditStats);

export default router;