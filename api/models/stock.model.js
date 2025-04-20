import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
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

// Rename createdAt and updatedAt to match the requirements
stockSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.dateAdded = ret.createdAt;
    ret.lastUpdated = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock; 