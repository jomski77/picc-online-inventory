import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, TextInput, Modal, Spinner, Badge, Tooltip, Label, Select, Alert } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaSearch, FaLock, FaLockOpen, FaEdit, FaUpload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { apiGet, apiPut, apiDelete } from '../utils/apiConfig';

export default function ManageUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [toggleAdminLoading, setToggleAdminLoading] = useState(null);
  const [toggleAdminSuccess, setToggleAdminSuccess] = useState(null);
  const [toggleAdminError, setToggleAdminError] = useState(null);
  const [toggleStatusLoading, setToggleStatusLoading] = useState(null);
  const [toggleStatusSuccess, setToggleStatusSuccess] = useState(null);
  const [toggleStatusError, setToggleStatusError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editError, setEditError] = useState(null);
  const filePickerRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.isAdmin) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let endpoint = 'user';
        if (searchTerm) {
          endpoint += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await apiGet(endpoint);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
          throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already triggered in the useEffect through searchTerm state
  };

  const handleDelete = async (userId) => {
    setDeleteLoading(true);
    
    try {
      const response = await apiDelete(`user/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
      }
      
      setUsers(users.filter(user => user._id !== userId));
      setShowDeleteModal(false);
      setDeleteSuccess('User successfully deleted');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setDeleteError(err.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      setToggleAdminLoading(userId);
      
      const response = await apiPut(`user/${userId}/toggle-admin`, {
        isAdmin: !isAdmin
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to update admin status: ${response.status}`);
      }
      
      // Update users state with the updated user
      const data = await response.json();
      setUsers(users.map(user => user._id === userId ? data : user));
      
      setToggleAdminSuccess(`User ${data.username} admin status updated`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setToggleAdminSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setToggleAdminError(err.message || 'Failed to update admin status. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setToggleAdminError(null);
      }, 3000);
    } finally {
      setToggleAdminLoading(null);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      setToggleStatusLoading(userId);
      
      const response = await apiPut(`user/${userId}/toggle-status`, {
        isActive: !isActive
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to update user status: ${response.status}`);
      }
      
      // Update users state with the updated user
      const data = await response.json();
      setUsers(users.map(user => user._id === userId ? data : user));
      
      setToggleStatusSuccess(`User ${data.username} ${data.isActive ? 'activated' : 'deactivated'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setToggleStatusSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setToggleStatusError(err.message || 'Failed to update user status. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setToggleStatusError(null);
      }, 3000);
    } finally {
      setToggleStatusLoading(null);
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
    
    if (!userToEdit) return;
    
    setUpdateLoading(true);
    
    try {
      const response = await apiPut(`user/${userToEdit._id}`, {
        username: formData.username,
        email: formData.email,
        department: formData.department,
        jobTitle: formData.jobTitle,
        password: formData.password || undefined
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `Failed to update user: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the user in the state
      setUsers(users.map(user => user._id === userToEdit._id ? data : user));
      
      // Close the modal and reset form
      setUserToEdit(null);
      setUpdateSuccess('User updated successfully');
      setShowEditModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="p-4">
        <Alert color="failure">
          <span>You do not have permission to access this page. Please contact an administrator.</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      
      {error && (
        <Alert color="failure" className="mb-4">
          <span>{error}</span>
        </Alert>
      )}
      
      {deleteSuccess && (
        <Alert color="success" className="mb-4">
          <span>{deleteSuccess}</span>
        </Alert>
      )}
      
      {toggleAdminSuccess && (
        <Alert color="success" className="mb-4">
          <span>{toggleAdminSuccess}</span>
        </Alert>
      )}
      
      {toggleStatusSuccess && (
        <Alert color="success" className="mb-4">
          <span>{toggleStatusSuccess}</span>
        </Alert>
      )}
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500" />
          </div>
          <TextInput
            type="search"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>
      
      {loading ? (
        <div className="flex justify-center items-center my-8">
          <Spinner aria-label="Loading users..." size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Avatar</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Department</Table.HeadCell>
              <Table.HeadCell>Job Title</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {users.length > 0 ? (
                users.map((user) => (
                  <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      <img
                        src={user.profilePicture || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
                        alt={`${user.username}'s profile`}
                        className="w-10 h-10 rounded-full"
                      />
                    </Table.Cell>
                    <Table.Cell>{user.username}</Table.Cell>
                    <Table.Cell>{user.email}</Table.Cell>
                    <Table.Cell>{user.department || 'N/A'}</Table.Cell>
                    <Table.Cell>{user.jobTitle || user.role || 'N/A'}</Table.Cell>
                    <Table.Cell>
                      {user._id !== currentUser._id && (
                        <Button
                          size="xs"
                          color={user.isAdmin ? 'failure' : 'success'}
                          onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                        >
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      )}
                      {user._id === currentUser._id && (
                        <Badge color="purple">You</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {user.isActive !== false ? (
                        <Badge color="success">Active</Badge>
                      ) : (
                        <Badge color="failure">Inactive</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className="flex flex-row space-x-2">
                      <Tooltip content="Edit User">
                        <Button
                          size="xs"
                          color="info"
                          onClick={() => handleEditClick(user)}
                        >
                          <FaEdit className="mr-1" /> Edit
                        </Button>
                      </Tooltip>
                      {user._id !== currentUser._id && (
                        <>
                          <Tooltip content={user.isActive !== false ? "Deactivate User" : "Activate User"}>
                            <Button
                              size="xs"
                              color={user.isActive !== false ? "warning" : "success"}
                              onClick={() => {
                                setUserToToggleStatus(user);
                                setShowStatusModal(true);
                              }}
                            >
                              {user.isActive !== false ? (
                                <>
                                  <FaLock className="mr-1" /> Lock
                                </>
                              ) : (
                                <>
                                  <FaLockOpen className="mr-1" /> Unlock
                                </>
                              )}
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete User">
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={8} className="text-center">
                    No users found.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
              <div className="mt-2 font-bold text-gray-900 dark:text-white">
                {userToDelete?.username}
              </div>
            </h3>
            <div className="flex justify-center gap-4">
              <Button 
                color="failure" 
                onClick={() => handleDelete(userToDelete._id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      
      {/* Status Toggle Modal */}
      <Modal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {userToToggleStatus?.isActive !== false
                ? "Are you sure you want to deactivate this user?"
                : "Are you sure you want to activate this user?"}
              <div className="mt-2 font-bold text-gray-900 dark:text-white">
                {userToToggleStatus?.username}
              </div>
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={userToToggleStatus?.isActive !== false ? "warning" : "success"}
                onClick={() => handleToggleStatus(userToToggleStatus._id, userToToggleStatus.isActive)}
                disabled={toggleStatusLoading === userToToggleStatus?._id}
              >
                {toggleStatusLoading === userToToggleStatus?._id ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  userToToggleStatus?.isActive !== false ? "Deactivate" : "Activate"
                )}
              </Button>
              <Button color="gray" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        popup
        size="xl"
      >
        <Modal.Header>
          <div className="text-xl font-medium text-gray-900 dark:text-white">
            Edit User - {userToEdit?.username}
          </div>
        </Modal.Header>
        <Modal.Body>
          {updateSuccess && (
            <Alert color="success" className="mb-4">
              <span>{updateSuccess}</span>
            </Alert>
          )}
          {error && (
            <Alert color="failure" className="mb-4">
              <span>{error}</span>
            </Alert>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="mb-4 flex flex-col items-center justify-center">
              <img
                src={imageFileUrl || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
              <Button
                size="sm"
                onClick={() => filePickerRef.current.click()}
                className="mt-2"
              >
                <FaUpload className="mr-2" /> Change Avatar
              </Button>
              <input
                type="file"
                ref={filePickerRef}
                onChange={handleImageChange}
                hidden
                accept="image/*"
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="username" value="Username" />
              </div>
              <TextInput
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleEditInputChange}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleEditInputChange}
                required
                type="email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="department" value="Department" />
                </div>
                <TextInput
                  id="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleEditInputChange}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="jobTitle" value="Job Title" />
                </div>
                <TextInput
                  id="jobTitle"
                  placeholder="Job Title"
                  value={formData.jobTitle}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="New Password (leave blank to keep current)" />
              </div>
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleEditInputChange}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button color="info" type="submit" disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update User"
                )}
              </Button>
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
} 