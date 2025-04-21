import { Alert, Button, Label, Spinner, TextInput, FileInput } from 'flowbite-react';
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/supabaseStorage';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrorMessage('Profile picture must be less than 2MB');
        fileInputRef.current.value = '';
        setProfileImage(null);
        setImagePreview(null);
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('Please fill in all fields');
    }
    
    if (!profileImage) {
      return setErrorMessage('Please upload a profile picture');
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Upload image to Supabase first
      setUploadingImage(true);
      const uploadResult = await uploadImage(profileImage);
      setUploadingImage(false);
      
      if (!uploadResult.success) {
        setLoading(false);
        return setErrorMessage(`Failed to upload profile picture: ${uploadResult.message}`);
      }
      
      // Submit user data with the image URL
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profilePicture: uploadResult.url
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate('/sign-in');
      } else {
        setLoading(false);
        setErrorMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.message || 'Something went wrong');
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1'>
          <Link to='/' className='text-4xl font-bold dark:text-white'>
            <span className='px-2 py-1 bg-blue-600 rounded-lg text-white'>
              PICC
            </span>
            Inventory
          </Link>
          <p className='text-sm mt-5 dark:text-gray-400'>
            Sign up to start using the PICC Insertion Team Inventory System.
            Create an account to manage inventory and track usage.
          </p>
        </div>
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your username' />
              <TextInput
                type='text'
                placeholder='Username'
                id='username'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput
                type='password'
                placeholder='Password'
                id='password'
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value='Profile picture' />
              <FileInput
                id='profilePicture'
                accept='image/*'
                onChange={handleImageChange}
                ref={fileInputRef}
                helperText='Max size: 2MB. A profile picture is required.'
              />
              {imagePreview && (
                <div className='mt-2'>
                  <div className='w-20 h-20 rounded-full overflow-hidden'>
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
              )}
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading || uploadingImage}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>
                    {uploadingImage ? 'Uploading image...' : 'Creating account...'}
                  </span>
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span className='dark:text-gray-400'>Already have an account?</span>
            <Link to='/sign-in' className='text-blue-500'>
              Sign In
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
} 