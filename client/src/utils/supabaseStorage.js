import { createClient } from '@supabase/supabase-js';

// Supabase storage configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eurzpxkjndcnhmdsggvs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cnpweGtqbmRjbmhtZHNnZ3ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzAzOTM3MCwiZXhwIjoyMDUyNjE1MzcwfQ.BT3kUVpwSibX34FLj6tqW3cH5lRqghnGsBJrQP_VxyE';
const STORAGE_URL = import.meta.env.VITE_SUPABASE_STORAGE_URL || 'https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/s3';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Default bucket name
export const DEFAULT_BUCKET = 'picc-inventory-images';

// Create a bucket if it doesn't exist
const createBucketIfNotExists = async (bucketName) => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.status === 404) {
      // Bucket doesn't exist, create it
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Makes files publicly accessible
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      return true;
    }
    
    return !error;
  } catch (error) {
    console.error('Error checking bucket:', error);
    return false;
  }
};

// Ensure bucket exists on app initialization
export const initializeStorage = async () => {
  console.log('Initializing Supabase storage...');
  try {
    const bucketExists = await createBucketIfNotExists(DEFAULT_BUCKET);
    if (bucketExists) {
      console.log(`Bucket "${DEFAULT_BUCKET}" is ready`);
      return true;
    } else {
      console.error(`Failed to initialize bucket "${DEFAULT_BUCKET}"`);
      return false;
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
    return false;
  }
};

// Generate a GUID/UUID for unique filenames
const generateGUID = () => {
  // Implementation of RFC4122 version 4 compliant UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Upload image to Supabase Storage
export const uploadImage = async (file, bucketName = 'picc-inventory-images') => {
  try {
    console.log('Starting image upload process for file:', file.name);
    
    // Ensure bucket exists
    const bucketExists = await createBucketIfNotExists(bucketName);
    if (!bucketExists) {
      console.error('Bucket creation/access failed:', bucketName);
      throw new Error('Failed to create/access bucket');
    }
    
    // Create a unique file name using GUID to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const guid = generateGUID();
    const fileName = `${guid}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('Uploading file with GUID-based name:', filePath, 'in bucket:', bucketName);
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    console.log('File uploaded successfully, getting public URL');
    
    // Get public URL for the uploaded file
    const { data: publicURLData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!publicURLData || !publicURLData.publicUrl) {
      console.error('Failed to get public URL:', publicURLData);
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    console.log('Upload successful with URL:', publicURLData.publicUrl);
    
    // Validate the URL format
    let validUrl;
    try {
      validUrl = new URL(publicURLData.publicUrl);
      
      // Make sure URL is absolute
      if (!validUrl.protocol || !validUrl.host) {
        console.error('URL is missing protocol or host:', publicURLData.publicUrl);
        throw new Error('Generated URL is missing protocol or host');
      }
      
      // Log URL components for debugging
      console.log('URL components:', {
        href: validUrl.href,
        protocol: validUrl.protocol,
        host: validUrl.host,
        pathname: validUrl.pathname
      });
      
      // Verify URL doesn't contain any unintended components
      if (validUrl.href.includes('undefined') || validUrl.href.includes('null')) {
        console.error('URL contains invalid parts:', validUrl.href);
        throw new Error('Generated URL contains invalid parts');
      }
      
    } catch (urlError) {
      console.error('Invalid URL format:', publicURLData.publicUrl, urlError);
      
      // Try to construct a full URL if the returned value is a partial path
      if (publicURLData.publicUrl && typeof publicURLData.publicUrl === 'string') {
        try {
          // Try to manually construct the URL using storage URL
          const fullUrl = `${STORAGE_URL}/object/public/${bucketName}/${filePath}`;
          console.log('Attempting to construct full URL manually:', fullUrl);
          validUrl = new URL(fullUrl);
        } catch (fallbackError) {
          console.error('Failed to construct fallback URL:', fallbackError);
          throw new Error('Generated URL is not valid and fallback construction failed');
        }
      } else {
        throw new Error('Generated URL is not valid');
      }
    }
    
    // Use the validated URL or the constructed fallback
    const finalImageUrl = validUrl ? validUrl.href : publicURLData.publicUrl;
    console.log('Final image URL to use:', finalImageUrl);
    
    return {
      success: true,
      url: finalImageUrl,
      path: filePath,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload image',
    };
  }
};

// Delete an image from Supabase Storage
export const deleteImage = async (filePath, bucketName = 'picc-inventory-images') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: 'Image deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete image',
    };
  }
};

export default {
  uploadImage,
  deleteImage,
  initializeStorage,
}; 