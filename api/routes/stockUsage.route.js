import express from 'express';
import { 
  addStockUsage, 
  deleteStockUsage, 
  getStockUsageById, 
  getStockUsageHistory,
  getStockUsageCount,
  updateStockUsage 
} from '../controllers/stockUsage.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, addStockUsage);
router.get('/', verifyToken, getStockUsageHistory);
router.get('/count', verifyToken, getStockUsageCount);
router.get('/:stockUsageId', verifyToken, getStockUsageById);

// Admin-only routes
router.put('/:stockUsageId', verifyAdmin, updateStockUsage);
router.delete('/:stockUsageId', verifyAdmin, deleteStockUsage);

export default router; 