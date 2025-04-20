import express from 'express';
import { 
  addStock, 
  deleteStock, 
  getStockById, 
  getStockHistory,
  getStockCount,
  updateStock 
} from '../controllers/stock.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, addStock);
router.get('/', verifyToken, getStockHistory);
router.get('/count', verifyToken, getStockCount);
router.get('/:stockId', verifyToken, getStockById);

// Admin-only routes
router.put('/:stockId', verifyAdmin, updateStock);
router.delete('/:stockId', verifyAdmin, deleteStock);

export default router; 