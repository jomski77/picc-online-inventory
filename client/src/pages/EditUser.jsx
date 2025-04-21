import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, TextInput, Spinner, Alert, Label, Card } from 'flowbite-react';
import { FaArrowLeft } from 'react-icons/fa';
import { uploadImage } from '../utils/supabaseStorage';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    department: '',
    jobTitle: '',
    password: '',
    profilePicture: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [error, setError] = useState(null);
  const filePickerRef = useRef();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`/api/user/${id}`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          department: data.department || '',
          jobTitle: data.jobTitle || data.role || '',
          password: '',
          profilePicture: data.profilePicture || '',
        });
        setImageFileUrl(data.profilePicture || '');
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Profile picture must be less than 2MB');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (updateLoading || imageFileUploading) return;
    
    try {
      setUpdateLoading(true);
      setError(null);
      setUpdateSuccess(null);
      
      // Handle image upload if an image was selected
      let imageUrl = formData.profilePicture;
      
      if (imageFile) {
        const uploadResult = await uploadImageToSupabase(imageFile);
        if (!uploadResult.success) {
          setError(uploadResult.message);
          setUpdateLoading(false);
          return;
        }
        
        // Validate the image URL
        if (!uploadResult.url || typeof uploadResult.url !== 'string') {
          console.error('Invalid image URL returned:', uploadResult.url);
          setError('Invalid image URL returned from storage');
          setUpdateLoading(false);
          return;
        }
        
        // Additional validation to ensure URL is properly formatted
        if (!uploadResult.url.startsWith('http://') && !uploadResult.url.startsWith('https://')) {
          console.error('URL does not start with http:// or https://', uploadResult.url);
          setError('Invalid image URL format returned from storage');
          setUpdateLoading(false);
          return;
        }
        
        imageUrl = uploadResult.url;
        console.log('Profile image successfully uploaded, URL:', imageUrl);
      }
      
      // Prepare the user data object
      const userData = {
        ...user,
        username: formData.username,
        email: formData.email,
        department: formData.department,
        jobTitle: formData.jobTitle,
        profilePicture: imageUrl,
      };
      
      // Only include password in the update if it was provided
      if (formData.password) {
        userData.password = formData.password;
      }
      
      const res = await fetch(`/api/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to update user");
        setUpdateLoading(false);
        return;
      }
      
      setUpdateSuccess('User updated successfully');
      setUpdateLoading(false);
      
      // Reset password field
      setFormData({
        ...formData,
        password: '',
      });
      
      setImageFile(null);
    } catch (error) {
      setError(error.message);
      setUpdateLoading(false);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <Button 
        color="gray" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate('/manage-users')}
      >
        <FaArrowLeft className="mr-2" /> Back to Users
      </Button>

      <h1 className='text-3xl font-bold mb-6 text-center dark:text-white'>
        Edit User
      </h1>
      
      {loading ? (
        <div className='flex justify-center items-center min-h-[400px]'>
          <Spinner size='xl' />
        </div>
      ) : error && !user ? (
        <Alert color="failure">
          {error}
        </Alert>
      ) : (
        <Card className="p-4">
          {updateSuccess && (
            <Alert color="success" className="mb-4">
              {updateSuccess}
            </Alert>
          )}
          
          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="relative w-32 h-32 mb-3 cursor-pointer group" 
                onClick={() => filePickerRef.current.click()}
              >
                <img
                  src={imageFileUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                  alt="Profile"
                  className="rounded-full w-32 h-32 object-cover border border-gray-200 shadow-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {imageFileUploading ? (
                    <Spinner color="white" size="md" />
                  ) : (
                    <span className="text-white text-sm font-medium">Change Photo</span>
                  )}
                </div>
                <input
                  type="file"
                  ref={filePickerRef}
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Click on the image to upload a new profile picture
                <br />
                <span className="text-xs">(Maximum file size: 2MB)</span>
              </div>
            </div>

            {/* User Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <Label htmlFor="username" value="Username" />
                </div>
                <TextInput
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <div className="mb-2">
                  <Label htmlFor="department" value="Department" />
                </div>
                <TextInput
                  id="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Nursing, IT, Administration"
                />
              </div>
              
              <div>
                <div className="mb-2">
                  <Label htmlFor="jobTitle" value="Job Title" />
                </div>
                <TextInput
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Nurse, Physician, Manager"
                />
              </div>
            </div>
            
            <div>
              <div className="mb-2">
                <Label htmlFor="password" value="New Password (leave blank to keep unchanged)" />
              </div>
              <TextInput
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                color="gray" 
                onClick={() => navigate('/manage-users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                gradientDuoTone="purpleToPink"
                disabled={updateLoading || imageFileUploading}
              >
                {updateLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
} 