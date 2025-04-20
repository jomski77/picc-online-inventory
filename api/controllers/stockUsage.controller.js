import StockUsage from '../models/stockUsage.model.js';
import Item from '../models/item.model.js';
import { errorHandler } from '../utils/error.js';

export const addStockUsage = async (req, res, next) => {
  try {
    const { item, quantity } = req.body;
    
    // Validate item exists
    const itemDoc = await Item.findById(item);
    if (!itemDoc) {
      return next(errorHandler(404, 'Item not found'));
    }
    
    // Check if there's enough stock
    if (itemDoc.currentStock < quantity) {
      return next(errorHandler(400, 'Not enough stock available'));
    }
    
    // Create new stock usage entry
    const newStockUsage = new StockUsage({
      item,
      quantity,
      createdBy: req.user.id,
    });
    
    // Save the stock usage record
    const savedStockUsage = await newStockUsage.save();
    
    // Update item's current stock
    await Item.findByIdAndUpdate(
      item,
      { $inc: { currentStock: -quantity } },
      { new: true }
    );
    
    res.status(201).json(savedStockUsage);
  } catch (error) {
    next(error);
  }
};

export const getStockUsageHistory = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.query.item) {
      query.item = req.query.item;
    }
    
    if (req.query.user && req.user.isAdmin) {
      query.createdBy = req.query.user;
    }
    
    // Build the query with optional parameters
    let usageQuery = StockUsage.find(query)
      .populate('item', 'name');
    
    // Only populate createdBy if requested or by default
    if (req.query.populate === 'createdBy' || !req.query.hasOwnProperty('populate')) {
      usageQuery = usageQuery.populate('createdBy', 'username');
    }
    
    // Ensure precise date and time sorting (newest first)
    // MongoDB will use createdAt which includes both date and time for accurate chronological sorting
    usageQuery = usageQuery.sort({ createdAt: -1 });
    
    // Log sorting criteria in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('StockUsage API - Sorting records by createdAt in descending order');
    }
    
    // Get total count for pagination
    const totalItems = await StockUsage.countDocuments(query);
    
    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : (page - 1) * limit;
    
    // Apply pagination
    usageQuery = usageQuery.skip(skip).limit(limit);
    
    // Execute query
    const stockUsageHistory = await usageQuery;
    
    // Return with pagination metadata if page parameter is provided
    if (req.query.page) {
      res.status(200).json({
        items: stockUsageHistory,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      });
    } else {
      res.status(200).json(stockUsageHistory);
    }
  } catch (error) {
    next(error);
  }
};

export const getStockUsageCount = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.query.item) {
      query.item = req.query.item;
    }
    
    if (req.query.user && req.user.isAdmin) {
      query.createdBy = req.query.user;
    }
    
    // Get count of stock usage records matching query
    const count = await StockUsage.countDocuments(query);
    
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

export const getStockUsageById = async (req, res, next) => {
  try {
    const stockUsage = await StockUsage.findById(req.params.stockUsageId)
      .populate('item', 'name')
      .populate('createdBy', 'username');
      
    if (!stockUsage) {
      return next(errorHandler(404, 'Stock usage record not found'));
    }
    
    res.status(200).json(stockUsage);
  } catch (error) {
    next(error);
  }
};

export const updateStockUsage = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can update stock usage records'));
    }
    
    const stockUsage = await StockUsage.findById(req.params.stockUsageId);
    if (!stockUsage) {
      return next(errorHandler(404, 'Stock usage record not found'));
    }
    
    // Get the item
    const item = await Item.findById(stockUsage.item);
    
    // Calculate the difference in quantity
    const quantityDifference = req.body.quantity - stockUsage.quantity;
    
    // Check if there's enough stock for an increase in usage
    if (quantityDifference > 0 && item.currentStock < quantityDifference) {
      return next(errorHandler(400, 'Not enough stock available for this update'));
    }
    
    // Update the stock usage record
    const updatedStockUsage = await StockUsage.findByIdAndUpdate(
      req.params.stockUsageId,
      { $set: { quantity: req.body.quantity } },
      { new: true }
    );
    
    // Update the item's current stock
    await Item.findByIdAndUpdate(
      stockUsage.item,
      { $inc: { currentStock: -quantityDifference } },
      { new: true }
    );
    
    res.status(200).json(updatedStockUsage);
  } catch (error) {
    next(error);
  }
};

export const deleteStockUsage = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'Only admins can delete stock usage records'));
    }
    
    const stockUsage = await StockUsage.findById(req.params.stockUsageId);
    if (!stockUsage) {
      return next(errorHandler(404, 'Stock usage record not found'));
    }
    
    // Delete the stock usage record
    await StockUsage.findByIdAndDelete(req.params.stockUsageId);
    
    // Update the item's current stock
    await Item.findByIdAndUpdate(
      stockUsage.item,
      { $inc: { currentStock: stockUsage.quantity } },
      { new: true }
    );
    
    res.status(200).json({ message: 'Stock usage record deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 