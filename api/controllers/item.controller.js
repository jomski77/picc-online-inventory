import Item from '../models/item.model.js';
import { errorHandler } from '../utils/error.js';

export const createItem = async (req, res, next) => {
  try {
    const { name, picturePath, reorderThreshold } = req.body;
    
    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return next(errorHandler(400, 'Item with this name already exists'));
    }
    
    const newItem = new Item({
      name,
      picturePath,
      reorderThreshold: reorderThreshold || 10,
    });
    
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const query = req.query.search
      ? { name: { $regex: req.query.search, $options: 'i' } }
      : {};
    
    const items = await Item.find(query).sort({ name: 1 });
    
    // Log the first item for debugging if items exist
    if (items.length > 0) {
      console.log('First item from database:', items[0]);
    }
    
    // Return items as a flat array instead of an object with items property
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return next(errorHandler(404, 'Item not found'));
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can update items'));
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.itemId,
      {
        $set: {
          name: req.body.name,
          picturePath: req.body.picturePath,
          reorderThreshold: req.body.reorderThreshold,
        },
      },
      { new: true }
    );
    
    if (!updatedItem) {
      return next(errorHandler(404, 'Item not found'));
    }
    
    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can delete items'));
    }
    
    const item = await Item.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return next(errorHandler(404, 'Item not found'));
    }
    
    res.status(200).json({ message: 'Item has been deleted' });
  } catch (error) {
    next(error);
  }
};

export const getLowStockItems = async (req, res, next) => {
  try {
    const items = await Item.find({
      $expr: { $lte: ['$currentStock', '$reorderThreshold'] }
    }).sort({ currentStock: 1 });
    
    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
}; 