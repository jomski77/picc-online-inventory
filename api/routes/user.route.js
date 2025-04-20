import express from 'express';
import { 
  deleteUser, 
  getUser, 
  getUsers, 
  updateUser 
} from '../controllers/user.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// User routes
router.put('/:userId', verifyToken, updateUser);
router.delete('/:userId', verifyToken, deleteUser);
router.get('/:userId', verifyToken, getUser);

// Admin routes
router.get('/', verifyAdmin, getUsers);

export default router; 