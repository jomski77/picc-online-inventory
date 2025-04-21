import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, TextInput, Modal, Spinner, Badge, Tooltip, Label, Select, Alert } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaSearch, FaLock, FaLockOpen, FaEdit, FaUpload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ManageUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
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
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const filePickerRef = useRef();

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      return;
    }
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        let url = '/api/user';
        if (searchTerm) {
          url += `?search=${searchTerm}`;
        }
        
        const res = await fetch(url, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser?.isAdmin, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already triggered in the useEffect through searchTerm state
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/user/${userToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setShowModal(false);
        return;
      }
      
      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id));
      setShowModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const res = await fetch(`/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...user,
          isAdmin: !user.isAdmin,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        return;
      }
      
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u
        )
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleStatus = async () => {
    try {
      // Get the current user to toggle
      const user = userToToggleStatus;
      
      // The user may not have an isActive property yet, so we'll set it to the opposite of its current value
      // If it doesn't exist, assume the user is currently active (true) and set to inactive (false)
      const isActive = user.isActive === undefined ? true : user.isActive;
      
      const res = await fetch(`/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...user,
          isActive: !isActive,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setShowStatusModal(false);
        return;
      }
      
      // Update the user in the list with the new status
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !isActive } : u
        )
      );
      
      setShowStatusModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      department: user.department || '',
      jobTitle: user.jobTitle || user.role || '',
      password: '',
      profilePicture: user.profilePicture || '',
    });
    setImageFileUrl(user.profilePicture || '');
    setUpdateSuccess(null);
    setError(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (updateLoading) return;
    
    try {
      setUpdateLoading(true);
      setError(null);
      setUpdateSuccess(null);
      
      // Handle image upload if an image was selected
      let profilePictureUrl = formData.profilePicture;
      
      if (imageFile) {
        // In a real app, you would upload to a storage service like S3 or Firebase Storage
        // For this demo, we'll simulate an upload by creating a data URL
        // This is not how you'd do it in production
        const reader = new FileReader();
        const uploadPromise = new Promise((resolve) => {
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          reader.readAsDataURL(imageFile);
        });
        
        profilePictureUrl = await uploadPromise;
      }
      
      // Prepare the user data object
      const userData = {
        ...userToEdit,
        username: formData.username,
        email: formData.email,
        department: formData.department,
        jobTitle: formData.jobTitle,
        profilePicture: profilePictureUrl,
      };
      
      // Only include password in the update if it was provided
      if (formData.password) {
        userData.password = formData.password;
      }
      
      const res = await fetch(`/api/user/${userToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setUpdateLoading(false);
        return;
      }
      
      // Update the user in the list with the new details
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userToEdit._id ? { 
            ...u, 
            username: formData.username,
            email: formData.email,
            department: formData.department,
            jobTitle: formData.jobTitle,
            profilePicture: profilePictureUrl,
          } : u
        )
      );
      
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
    <div className='p-3 max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Manage Users
      </h1>
      
      <form onSubmit={handleSearch} className='flex gap-2 mb-6'>
        <TextInput
          type='text'
          placeholder='Search user by username or email'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='flex-1'
        />
        <Button type='submit' gradientDuoTone='purpleToPink'>
          <FaSearch className='mr-2' />
          Search
        </Button>
      </form>
      
      {loading ? (
        <div className='flex justify-center items-center min-h-[400px]'>
          <Spinner size='xl' />
        </div>
      ) : error ? (
        <div className='text-center text-red-500'>
          <p>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className='text-center dark:text-white min-h-[400px] flex items-center justify-center'>
          <p>No users found</p>
        </div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Image</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Job Title</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {users.map((user) => (
              <Table.Row 
                key={user._id} 
                className={`${user.isActive === false ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}
              >
                <Table.Cell>
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className={`w-10 h-10 rounded-md object-cover ${user.isActive === false ? 'opacity-60 grayscale' : ''}`}
                  />
                </Table.Cell>
                <Table.Cell className={`font-medium text-gray-900 dark:text-white ${user.isActive === false ? 'line-through opacity-70' : ''}`}>
                  {user.username}
                  {user.department && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Department: {user.department}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell className={user.isActive === false ? 'opacity-70' : ''}>
                  {user.email}
                  {user.jobTitle && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Job Title: {user.jobTitle}
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {user.isAdmin ? (
                    <Badge color='success'>Admin</Badge>
                  ) : (
                    <Badge color='info'>User</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {user.isActive === false ? (
                    <Badge color='failure' className='flex items-center gap-1'>
                      <FaLock className="h-3 w-3" />
                      Inactive
                    </Badge>
                  ) : (
                    <Badge color='success' className='flex items-center gap-1'>
                      <FaLockOpen className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className='flex gap-2 flex-wrap'>
                    <Button
                      size='xs'
                      color='info'
                      as={Link}
                      to={`/edit-user/${user._id}`}
                      disabled={user._id === currentUser._id}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </Button>
                    <Button
                      size='xs'
                      color={user.isAdmin ? 'warning' : 'success'}
                      onClick={() => handleToggleAdmin(user)}
                      disabled={user._id === currentUser._id}
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      size='xs'
                      color={user.isActive === false ? 'success' : 'warning'}
                      onClick={() => {
                        setUserToToggleStatus(user);
                        setShowStatusModal(true);
                      }}
                      disabled={user._id === currentUser._id}
                    >
                      {user.isActive === false ? 'Activate' : 'Deactivate'}
                    </Button>
                    <Button
                      size='xs'
                      color='failure'
                      onClick={() => {
                        setUserToDelete(user);
                        setShowModal(true);
                      }}
                      disabled={user._id === currentUser._id}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      
      {/* Delete User Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete user{' '}
              <span className='font-bold'>{userToDelete?.username}</span>?
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
      
      {/* Toggle Status Modal */}
      <Modal show={showStatusModal} onClose={() => setShowStatusModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              {userToToggleStatus?.isActive === false ? (
                <>
                  Are you sure you want to <span className='font-bold text-green-500'>activate</span> user{' '}
                  <span className='font-bold'>{userToToggleStatus?.username}</span>?
                  <p className='mt-2 text-sm'>This will allow them to log in and use the application.</p>
                </>
              ) : (
                <>
                  Are you sure you want to <span className='font-bold text-red-500'>deactivate</span> user{' '}
                  <span className='font-bold'>{userToToggleStatus?.username}</span>?
                  <p className='mt-2 text-sm'>This will prevent them from logging in and using the application.</p>
                </>
              )}
            </h3>
            <div className='flex justify-center gap-4'>
              <Button 
                color={userToToggleStatus?.isActive === false ? 'success' : 'failure'} 
                onClick={handleToggleStatus}
              >
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowStatusModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} size='xl'>
        <Modal.Header>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Edit User: {userToEdit?.username}
          </h3>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Profile Picture Section */}
              <div className="mb-4 md:w-1/3 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-3">
                  <img
                    src={imageFileUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt="Profile"
                    className="rounded-full w-32 h-32 object-cover border-2 border-gray-200"
                  />
                  <Button
                    size="xs"
                    color="gray"
                    className="absolute bottom-0 right-0"
                    onClick={() => filePickerRef.current.click()}
                  >
                    <FaUpload className="mr-1" /> 
                    Change
                  </Button>
                  <input
                    type="file"
                    ref={filePickerRef}
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Click to upload a new profile picture
                </div>
              </div>
              
              {/* User Details Section */}
              <div className="space-y-4 md:w-2/3">
                {updateSuccess && (
                  <Alert color="success" className="mb-3">
                    {updateSuccess}
                  </Alert>
                )}
                
                {error && (
                  <Alert color="failure" className="mb-3">
                    {error}
                  </Alert>
                )}
              
                <div>
                  <div className="mb-2">
                    <Label htmlFor="username" value="Username" />
                  </div>
                  <TextInput
                    id="username"
                    value={formData.username}
                    onChange={handleEditInputChange}
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
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                
                <div>
                  <div className="mb-2">
                    <Label htmlFor="password" value="Password (leave blank to keep unchanged)" />
                  </div>
                  <TextInput
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleEditInputChange}
                    placeholder="New password"
                  />
                </div>
                
                <div>
                  <div className="mb-2">
                    <Label htmlFor="department" value="Department" />
                  </div>
                  <TextInput
                    id="department"
                    value={formData.department}
                    onChange={handleEditInputChange}
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
                    onChange={handleEditInputChange}
                    placeholder="e.g. Nurse, Physician, Manager"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                gradientDuoTone="purpleToPink"
                disabled={updateLoading}
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
        </Modal.Body>
      </Modal>
    </div>
  );
} 