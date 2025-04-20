import mongoose from 'mongoose';

const stockUsageSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Rename createdAt to match the requirements
stockUsageSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.dateAdded = ret.createdAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const StockUsage = mongoose.model('StockUsage', stockUsageSchema);

export default StockUsage; 