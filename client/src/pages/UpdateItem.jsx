import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, TextInput, Spinner, Modal } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { uploadImage, deleteImage } from '../utils/supabaseStorage';

export default function UpdateItem() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    reorderThreshold: 10,
    picturePath: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [originalImagePath, setOriginalImagePath] = useState('');
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const filePickerRef = useRef();
  const navigate = useNavigate();
  const { itemId } = useParams();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`/api/items/${itemId}`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch item details');
        }
        
        const data = await res.json();
        
        setFormData({
          name: data.name,
          reorderThreshold: data.reorderThreshold,
          picturePath: data.picturePath,
        });
        
        setImageFileUrl(data.picturePath);
        setOriginalImagePath(data.picturePath);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [itemId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file) => {
    setImageFileUploading(true);
    try {
      const result = await uploadImage(file);
      setImageFileUploading(false);
      return result;
    } catch (error) {
      setImageFileUploading(false);
      return { 
        success: false, 
        message: error.message || 'Error uploading image' 
      };
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: id === 'reorderThreshold' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      return setError('Please enter an item name');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Upload image if one was selected
      let imageUrl = formData.picturePath;
      
      if (imageFile) {
        const uploadResult = await uploadImageToSupabase(imageFile);
        if (!uploadResult.success) {
          setLoading(false);
          return setError(uploadResult.message);
        }
        imageUrl = uploadResult.url;
        
        // Delete old image if it exists and is from Supabase
        if (originalImagePath && originalImagePath.includes('supabase')) {
          // Extract the file path from the URL
          const pathParts = originalImagePath.split('/');
          const filePath = pathParts[pathParts.length - 1];
          if (filePath) {
            await deleteImage(filePath);
          }
        }
      }
      
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          picturePath: imageUrl,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setLoading(false);
        return setError(data.message);
      }
      
      setLoading(false);
      navigate('/dashboard');
      
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    setShowModal(false);
    
    try {
      // Delete image from Supabase if it exists and is from Supabase
      if (formData.picturePath && formData.picturePath.includes('supabase')) {
        // Extract the file path from the URL
        const pathParts = formData.picturePath.split('/');
        const filePath = pathParts[pathParts.length - 1];
        if (filePath) {
          await deleteImage(filePath);
        }
      }
      
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return setError(data.message);
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Update Item
      </h1>
      
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='w-full flex flex-col gap-4 md:flex-row'>
          <div className='flex-1'>
            <div className='mb-4'>
              <Label value='Item Name' />
              <TextInput
                type='text'
                id='name'
                placeholder='Enter item name'
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
            <Label value='Item Image' className='self-start mb-2' />
            <div 
              className='w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer'
              onClick={() => filePickerRef.current.click()}
            >
              {imageFileUrl ? (
                <img 
                  src={imageFileUrl} 
                  alt='Item preview' 
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
        
        <div className='flex gap-4'>
          <Button
            gradientDuoTone='purpleToPink'
            type='submit'
            disabled={loading || imageFileUploading}
            className='flex-1'
          >
            {loading ? (
              <>
                <Spinner size='sm' />
                <span className='pl-3'>Updating...</span>
              </>
            ) : (
              'Update Item'
            )}
          </Button>
          
          <Button
            color='failure'
            onClick={() => setShowModal(true)}
            className='flex-1'
            type='button'
          >
            Delete Item
          </Button>
        </div>
      </form>
      
      {error && (
        <Alert className='mt-5' color='failure'>
          {error}
        </Alert>
      )}
      
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete this item?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDelete}>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 