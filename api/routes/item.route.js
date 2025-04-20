import express from 'express';
import { 
  createItem, 
  deleteItem, 
  getItem, 
  getItems, 
  getLowStockItems, 
  updateItem 
} from '../controllers/item.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Items API is working!', success: true });
});

// Public routes
router.get('/', getItems);
router.get('/:itemId', getItem);
router.get('/low-stock/all', verifyToken, getLowStockItems);

// Admin routes
router.post('/', verifyAdmin, createItem);
router.put('/:itemId', verifyAdmin, updateItem);
router.delete('/:itemId', verifyAdmin, deleteItem);

export default router; 