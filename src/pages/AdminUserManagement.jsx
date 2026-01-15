import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { showToast } from '../utils/toastConfig.js';
import { formatDate } from '../utils/helpers.js';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    if (!authAPI.isAdmin()) {
      navigate('/login?type=admin');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      const errorMsg = 'Failed to load users. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await usersAPI.toggleUserStatus(userId);
      await loadUsers();
      const user = users.find(u => u.id === userId);
      showToast.success(`User ${user?.isActive ? 'disabled' : 'enabled'} successfully`);
    } catch (err) {
      showToast.error(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUserId(userToDelete.id);
      await usersAPI.deleteUser(userToDelete.id);
      showToast.success('User deleted successfully');
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      showToast.error(err.message || 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner size="lg" text="Loading users..." ariaLabel="Loading user management data" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage registered users and their accounts
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md" role="alert">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="user-search" className="sr-only">Search users</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="user-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, username, or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Search users"
            />
          </div>
        </div>

        {!users || users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Users Found"
            description="There are no registered users yet."
            ariaLabel="No users found"
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Users Match Your Search"
            description="Try adjusting your search criteria."
            ariaLabel="No users match search"
          />
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant={user.isActive ? 'danger' : 'success'}
                              size="sm"
                              onClick={() => handleToggleStatus(user.id)}
                              aria-label={user.isActive ? 'Disable user' : 'Enable user'}
                            >
                              {user.isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              aria-label={`Delete user ${user.username}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2" role="navigation" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300" aria-live="polite">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User"
      >
        {userToDelete && (
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete user <strong>{userToDelete.name || userToDelete.username}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deletingUserId === userToDelete.id}
                className="flex-1"
              >
                {deletingUserId === userToDelete.id ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUserManagement;

