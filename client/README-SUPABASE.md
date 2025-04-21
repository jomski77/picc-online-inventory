# Supabase Storage Integration for Inventory Images

This project uses Supabase Storage for managing inventory item images. This document provides instructions for setting up and using the Supabase storage functionality.

## Setup Instructions

### 1. Environment Variables

The application uses environment variables to securely store Supabase credentials. Create or update your `.env` file in the client directory with the following:

```
VITE_SUPABASE_URL=https://eurzpxkjndcnhmdsggvs.supabase.co
VITE_SUPABASE_ANON_KEY=af6e3217bc0f83d79972bc4bfe95d6977a01d366d5358d28fc8a02af2f2b2611
VITE_SUPABASE_STORAGE_URL=https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/s3
```

### 2. Required Dependencies

The project requires the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

## How It Works

### Storage Bucket

By default, all images are stored in a bucket named `picc-inventory-images`. This bucket is created automatically if it doesn't exist when the first image is uploaded.

### Image Upload Process

When you upload an image for an inventory item:

1. The image file is sent to Supabase Storage
2. A unique filename is generated to prevent conflicts
3. The public URL for the image is stored in the database as the item's `picturePath`

### Image Deletion

When you delete an item or update an item's image, the old image is automatically removed from Supabase Storage to prevent unused files from accumulating.

## Utility Functions

The application includes utility functions for managing images in `src/utils/supabaseStorage.js`:

- `uploadImage(file, bucketName)`: Uploads an image file to Supabase Storage
- `deleteImage(filePath, bucketName)`: Deletes an image from Supabase Storage

## Example Usage

```javascript
import { uploadImage, deleteImage } from '../utils/supabaseStorage';

// Upload an image
const handleImageUpload = async (file) => {
  const result = await uploadImage(file);
  if (result.success) {
    console.log('Image uploaded successfully:', result.url);
    // Store result.url in your database
  } else {
    console.error('Upload failed:', result.message);
  }
};

// Delete an image
const handleImageDelete = async (filePath) => {
  const result = await deleteImage(filePath);
  if (result.success) {
    console.log('Image deleted successfully');
  } else {
    console.error('Deletion failed:', result.message);
  }
};
```

## Troubleshooting

If you encounter issues with image uploads:

1. Check browser console for error messages
2. Verify your Supabase credentials in the .env file
3. Ensure the Supabase project has Storage enabled
4. Check that you have appropriate policies set up in your Supabase project 