import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    picturePath: {
      type: String,
      default: 'https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/object/public/picc-inventory-images/default-supply-image.png',
    },
    reorderThreshold: {
      type: Number,
      required: true,
      default: 10,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Rename createdAt and updatedAt to match the requirements
itemSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.dateCreated = ret.createdAt;
    ret.lastUpdated = ret.updatedAt;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

const Item = mongoose.model('Item', itemSchema);

export default Item; 