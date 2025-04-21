import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Button, TextInput, Modal, Label, Spinner } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { uploadImage } from '../utils/supabaseStorage';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { apiPut } from '../utils/apiConfig';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        department: currentUser.department || '',
        jobTitle: currentUser.jobTitle || currentUser.role || '',
      });
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        dispatch(updateFailure('Profile picture must be less than 2MB'));
        filePickerRef.current.value = '';
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImageToSupabase = async (file) => {
    setImageFileUploading(true);
    try {
      console.log('Uploading profile image:', file.name, file.type, file.size);
      const result = await uploadImage(file, 'profile-images');
      console.log('Upload result:', result);
      setImageFileUploading(false);
      return result;
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      setImageFileUploading(false);
      return { 
        success: false, 
        message: error.message || 'Error uploading image' 
      };
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.username === '' || formData.email === '') {
      return;
    }
    
    try {
      dispatch(updateStart());
      
      let imageUrl = currentUser.profilePicture;
      
      if (imageFile) {
        const uploadResult = await uploadImageToSupabase(imageFile);
        if (!uploadResult.success) {
          dispatch(updateFailure(uploadResult.message));
          return;
        }
        
        // Validate the image URL
        if (!uploadResult.url || typeof uploadResult.url !== 'string') {
          console.error('Invalid image URL returned:', uploadResult.url);
          dispatch(updateFailure('Invalid image URL returned from storage'));
          return;
        }
        
        // Additional validation to ensure URL is properly formatted
        if (!uploadResult.url.startsWith('http://') && !uploadResult.url.startsWith('https://')) {
          console.error('URL does not start with http:// or https://', uploadResult.url);
          dispatch(updateFailure('Invalid image URL format returned from storage'));
          return;
        }
        
        imageUrl = uploadResult.url;
        console.log('Profile image successfully uploaded, URL:', imageUrl);
      }
      
      // Use apiPut instead of direct fetch
      const res = await apiPut(`user/${currentUser._id}`, {
        ...formData,
        profilePicture: imageUrl,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        return;
      }
      
      dispatch(updateSuccess(data));
      setUpdateUserSuccess('Profile updated successfully');
      
      setTimeout(() => {
        setUpdateUserSuccess(null);
      }, 3000);
      
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    
    try {
      dispatch(deleteUserStart());
      
      const res = await fetch(`/api/user/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      
      dispatch(deleteUserSuccess());
      
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl dark:text-white'>Profile</h1>
      
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div 
          className='relative w-32 h-32 self-center cursor-pointer group'
          onClick={() => filePickerRef.current.click()}
        >
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='User'
            className='rounded-full w-32 h-32 object-cover border border-gray-200 shadow-sm'
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {imageFileUploading ? (
              <Spinner color="white" size="md" />
            ) : (
              <span className="text-white text-sm font-medium">Change Photo</span>
            )}
          </div>
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            ref={filePickerRef}
            hidden
          />
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Click on the image to upload a new profile picture
          <br />
          <span className="text-xs">(Maximum file size: 2MB)</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="mb-2">
              <Label htmlFor="username" value="Username" />
            </div>
            <TextInput
              id="username"
              type="text"
              value={formData.username || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="department" value="Department" />
            </div>
            <TextInput
              id="department"
              type="text"
              value={formData.department || ''}
              onChange={handleChange}
              placeholder="e.g. Nursing, IT, Administration"
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="jobTitle" value="Job Title" />
            </div>
            <TextInput
              id="jobTitle"
              type="text"
              value={formData.jobTitle || ''}
              onChange={handleChange}
              placeholder="e.g. Nurse, Physician, Manager"
            />
          </div>
        </div>

        <Button 
          type='submit' 
          gradientDuoTone='purpleToPink' 
          outline
          disabled={loading || imageFileUploading}
          className='mt-4'
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : 'Update Profile'}
        </Button>
      </form>
      
      {updateUserSuccess && (
        <Alert color='success' className='mt-5'>
          {updateUserSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert color='failure' className='mt-5'>
          {error}
        </Alert>
      )}
      
      <div className='text-red-500 flex justify-between mt-5'>
        <span 
          onClick={() => setShowModal(true)} 
          className='cursor-pointer hover:underline'
        >
          Delete Account
        </span>
      </div>
      
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete your account?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>
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