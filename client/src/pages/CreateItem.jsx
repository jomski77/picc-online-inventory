import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, TextInput, Spinner, Select } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToSupabase } from '../utils/supabaseStorage';
import { apiPost } from '../utils/apiConfig';

// Default image to use when no image is provided
const DEFAULT_IMAGE = 'https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/object/public/picc-inventory-images/default-supply-image.png';

export default function CreateItem() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    reorderThreshold: 10,
    picturePath: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const filePickerRef = useRef();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file) => {
    try {
      console.log('Uploading image file:', file.name, file.type, file.size);
      const result = await uploadImageToSupabase(file);
      console.log('Upload result:', result);
      setImageFileUploading(false);
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      setImageFileUploading(false);
      setError('Error uploading image: ' + error.message);
      return { success: false, message: error.message };
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: id === 'reorderThreshold' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      return setError('Name and category are required');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Upload image if selected
      let imageUrl = DEFAULT_IMAGE;
      
      if (imageFile) {
        const uploadResult = await uploadImageToSupabase(imageFile);
        if (!uploadResult.success) {
          setLoading(false);
          return setError(uploadResult.message);
        }
        imageUrl = uploadResult.url;
      }
      
      // Use apiPost instead of direct fetch
      const res = await apiPost('items', {
        ...formData,
        picturePath: imageUrl,
      });
      
      const data = await res.json();
      console.log('Item creation response:', data);
      
      if (!res.ok) {
        setLoading(false);
        return setError(data.message);
      }
      
      setLoading(false);
      navigate('/items');
      
    } catch (error) {
      console.error('Error creating item:', error);
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Create New Supply
      </h1>
      
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='w-full flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <div className='mb-4'>
              <Label value='Supply Name' />
              <TextInput
                type='text'
                id='name'
                placeholder='Enter supply name'
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className='mb-4'>
              <Label value='Reorder Threshold' />
              <TextInput
                type='number'
                id='reorderThreshold'
                placeholder='Enter reorder threshold'
                value={formData.reorderThreshold}
                onChange={handleChange}
                min={1}
                required
              />
              <p className='text-sm text-gray-500 mt-1 dark:text-gray-400'>
                Alert will be triggered when stock falls below this value
              </p>
            </div>
          </div>
          
          <div className='flex-1 flex flex-col items-center justify-start'>
            <Label value='Supply Image' className='self-start mb-2' />
            <div 
              className='w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer'
              onClick={() => filePickerRef.current.click()}
            >
              {imageFileUrl ? (
                <img 
                  src={imageFileUrl} 
                  alt='Supply preview' 
                  className='w-full h-full object-contain p-2'
                />
              ) : (
                <span className='text-gray-500 dark:text-gray-400'>
                  Click to upload image
                </span>
              )}
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                ref={filePickerRef}
                className='hidden'
              />
            </div>
            {imageFileUploading && (
              <div className='mt-2 flex items-center gap-2'>
                <Spinner size='sm' />
                <span>Uploading image...</span>
              </div>
            )}
          </div>
        </div>
        
        <Button
          gradientDuoTone='purpleToPink'
          type='submit'
          disabled={loading || imageFileUploading}
        >
          {loading ? (
            <>
              <Spinner size='sm' />
              <span className='pl-3'>Creating Supply...</span>
            </>
          ) : (
            'Create Supply'
          )}
        </Button>
      </form>
      
      {error && (
        <Alert className='mt-5' color='failure'>
          {error}
        </Alert>
      )}
    </div>
  );
} 