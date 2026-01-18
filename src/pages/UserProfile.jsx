import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, pollsAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { showToast } from '../utils/toastConfig.js';
import { getBookmarks, toggleBookmark } from '../utils/bookmarkUtils.js';
import { formatDate } from '../utils/helpers.js';

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
  });
  const [bookmarkedPolls, setBookmarkedPolls] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isUser()) {
      navigate('/login?type=user');
      return;
    }

    loadProfile();
    loadBookmarks();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = authAPI.getCurrentUser();
      
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          username: currentUser.username || '',
        });
      }
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      setBookmarksLoading(true);
      const bookmarkIds = getBookmarks();
      
      if (bookmarkIds.length === 0) {
        setBookmarkedPolls([]);
        return;
      }

      // Get all polls and filter for bookmarked ones
      const response = await pollsAPI.getAllPolls();
      const allPolls = Array.isArray(response.data) ? response.data : [];
      const bookmarked = allPolls.filter(poll => bookmarkIds.includes(poll.id));
      setBookmarkedPolls(bookmarked);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setBookmarkedPolls([]);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      showToast.warning('Name is required');
      setSaving(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      showToast.warning('Email is required');
      setSaving(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      showToast.warning('Please enter a valid email address');
      setSaving(false);
      return;
    }

    try {
      await authAPI.updateProfile(formData);
      showToast.success('Profile updated successfully!');
      // Reload profile to get updated data
      await loadProfile();
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBookmark = (pollId) => {
    toggleBookmark(pollId);
    setBookmarkedPolls(prev => prev.filter(poll => poll.id !== pollId));
    showToast.success('Removed from bookmarks');
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner size="lg" text="Loading profile..." ariaLabel="Loading user profile" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and bookmarks
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-selected={activeTab === 'profile'}
              role="tab"
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bookmarks'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              aria-selected={activeTab === 'bookmarks'}
              role="tab"
            >
              <span className="flex items-center gap-2">
                Bookmarks
                {bookmarkedPolls.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
                    {bookmarkedPolls.length}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-start" role="alert">
                  <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  aria-label="Username (cannot be changed)"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Username cannot be changed
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Full name"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Email address"
                  aria-required="true"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1"
                  aria-busy={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/polls')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarksLoading ? (
              <LoadingSpinner size="lg" text="Loading bookmarks..." ariaLabel="Loading bookmarked polls" />
            ) : bookmarkedPolls.length === 0 ? (
              <EmptyState
                icon="📌"
                title="No Bookmarked Polls"
                description="You haven't bookmarked any polls yet. Browse active polls and bookmark your favorites to find them here!"
                ariaLabel="No bookmarked polls"
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {bookmarkedPolls.map((poll) => {
                  const totalVotes = getTotalVotes(poll);
                  
                  return (
                    <Card key={poll.id} className="hover:shadow-lg transition-shadow flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Bookmarked
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 flex-grow">
                        {poll.question}
                      </h3>

                      {/* Category/Tags display */}
                      {(poll.category || (poll.tags && poll.tags.length > 0)) && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {poll.category && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                              {poll.category}
                            </span>
                          )}
                          {poll.tags && poll.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div><span className="font-medium">{poll.options.length}</span> options</div>
                        <div><span className="font-medium">{totalVotes}</span> total votes</div>
                        <div>Created: {formatDate(poll.createdAt)}</div>
                      </div>

                      <div className="border-t pt-4 mt-auto flex gap-2">
                        <Link
                          to={`/poll/${poll.id}`}
                          className="flex-1"
                          aria-label={`Vote on poll: ${poll.question}`}
                        >
                          <Button variant="secondary" size="sm" className="w-full">
                            Vote
                          </Button>
                        </Link>
                        <Link
                          to={`/results/${poll.id}`}
                          className="flex-1"
                          aria-label={`View results for poll: ${poll.question}`}
                        >
                          <Button variant="secondary" size="sm" className="w-full">
                            Results
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleRemoveBookmark(poll.id)}
                          className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
                          aria-label={`Remove from bookmarks: ${poll.question}`}
                          title="Remove from bookmarks"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

