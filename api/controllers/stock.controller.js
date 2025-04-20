import Stock from '../models/stock.model.js';
import Item from '../models/item.model.js';
import { errorHandler } from '../utils/error.js';

export const addStock = async (req, res, next) => {
  try {
    const { item, quantity } = req.body;
    
    // Validate item exists
    const itemExists = await Item.findById(item);
    if (!itemExists) {
      return next(errorHandler(404, 'Item not found'));
    }
    
    // Create new stock entry
    const newStock = new Stock({
      item,
      quantity,
      createdBy: req.user.id,
    });
    
    // Save the stock record
    const savedStock = await newStock.save();
    
    // Update item's current stock
    await Item.findByIdAndUpdate(
      item,
      { $inc: { currentStock: quantity } },
      { new: true }
    );
    
    res.status(201).json(savedStock);
  } catch (error) {
    next(error);
  }
};

export const getStockHistory = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.query.item) {
      query.item = req.query.item;
    }
    
    // Build the query with optional limit
    let stockQuery = Stock.find(query)
      .populate('item', 'name');
    
    // Only populate createdBy if requested or by default
    if (req.query.populate === 'createdBy' || !req.query.hasOwnProperty('populate')) {
      stockQuery = stockQuery.populate('createdBy', 'username');
    }
    
    // Ensure precise date and time sorting (newest first)
    // MongoDB will use createdAt which includes both date and time for accurate chronological sorting
    stockQuery = stockQuery.sort({ createdAt: -1 });
    
    // Log sorting criteria in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Stock API - Sorting records by createdAt in descending order');
    }
    
    // Get total count for pagination
    const totalItems = await Stock.countDocuments(query);
    
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : (page - 1) * limit;
    
    // Apply pagination
    stockQuery = stockQuery.skip(skip).limit(limit);
    
    // Execute query
    const stockHistory = await stockQuery;
    
    // Return with pagination metadata if page parameter is provided
    if (req.query.page) {
      res.status(200).json({
        items: stockHistory,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      });
    } else {
      res.status(200).json(stockHistory);
    }
  } catch (error) {
    next(error);
  }
};

export const getStockCount = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.query.item) {
      query.item = req.query.item;
    }
    
    // Get count of stock records matching query
    const count = await Stock.countDocuments(query);
    
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const getStockById = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.stockId)
      .populate('item', 'name')
      .populate('createdBy', 'username');
      
    if (!stock) {
      return next(errorHandler(404, 'Stock record not found'));
    }
    
    res.status(200).json(stock);
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can update stock records'));
    }
    
    const stock = await Stock.findById(req.params.stockId);
    if (!stock) {
      return next(errorHandler(404, 'Stock record not found'));
    }
    
    // Calculate the difference in quantity
    const quantityDifference = req.body.quantity - stock.quantity;
    
    // Update the stock record
    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.stockId,
      { $set: { quantity: req.body.quantity } },
      { new: true }
    );
    
    // Update the item's current stock
    await Item.findByIdAndUpdate(
      stock.item,
      { $inc: { currentStock: quantityDifference } },
      { new: true }
    );
    
    res.status(200).json(updatedStock);
  } catch (error) {
    next(error);
  }
};

export const deleteStock = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can delete stock records'));
    }
    
    const stock = await Stock.findById(req.params.stockId);
    if (!stock) {
      return next(errorHandler(404, 'Stock record not found'));
    }
    
    // Delete the stock record
    await Stock.findByIdAndDelete(req.params.stockId);
    
    // Update the item's current stock
    await Item.findByIdAndUpdate(
      stock.item,
      { $inc: { currentStock: -stock.quantity } },
      { new: true }
    );
    
    res.status(200).json({ message: 'Stock record deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 