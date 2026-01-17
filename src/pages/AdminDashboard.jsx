import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, getTimeRemaining, isPastDeadline } from '../utils/helpers.js';
import { showToast } from '../utils/toastConfig.js';
import * as bookmarkUtils from '../utils/bookmarkUtils.js';

const AdminDashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharePoll, setSharePoll] = useState(null);
  const [deletingPollId, setDeletePollId] = useState(null);
  const [moderatingPollId, setModeratingPollId] = useState(null);
  const [bookmarkedPolls, setBookmarkedPolls] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAuthenticated()) {
      // Try to load public polls anyway, but show message
      loadPublicPolls();
      return;
    }

    loadPolls();
    // Refresh polls every 30 seconds to update vote counts
    const interval = setInterval(loadPolls, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadPublicPolls = async () => {
    try {
      setLoading(true);
      setError('');
      // Try to load polls anyway
      const response = await pollsAPI.getAllPolls();
      const pollsData = Array.isArray(response.data) ? response.data : [];
      setPolls(pollsData);
      // Initialize bookmark states
      const bookmarks = {};
      pollsData.forEach(poll => {
        if (poll && poll.id) {
          bookmarks[poll.id] = bookmarkUtils.isBookmarked(poll.id);
        }
      });
      setBookmarkedPolls(bookmarks);
    } catch (err) {
      // Silently fail for public polls - just don't show error to user
      console.error('Failed to load public polls:', err);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await pollsAPI.getAllPolls();
      const pollsData = Array.isArray(response.data) ? response.data : [];
      setPolls(pollsData);
      // Initialize bookmark states
      const bookmarks = {};
      pollsData.forEach(poll => {
        if (poll && poll.id) {
          bookmarks[poll.id] = bookmarkUtils.isBookmarked(poll.id);
        }
      });
      setBookmarkedPolls(bookmarks);
    } catch (err) {
      const errorMsg = 'Failed to load polls. Please try again.';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (pollId) => {
    bookmarkUtils.toggleBookmark(pollId);
    setBookmarkedPolls(prev => ({
      ...prev,
      [pollId]: !prev[pollId]
    }));
    showToast.success(bookmarkedPolls[pollId] ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const copyPollLink = (pollId) => {
    const pollUrl = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(pollUrl).then(() => {
      showToast.success('Poll link copied to clipboard!');
    }).catch(() => {
      showToast.error('Failed to copy link');
    });
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletePollId(pollId);
      await pollsAPI.deletePoll(pollId);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      showToast.success('Poll deleted successfully');
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || 'Failed to delete poll. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setDeletePollId(null);
    }
  };

  const handleTogglePublish = async (poll) => {
    try {
      setModeratingPollId(poll.id);
      const updatedPoll = {
        ...poll,
        isPublished: !poll.isPublished,
      };
      await pollsAPI.updatePoll(poll.id, updatedPoll);
      setPolls((prev) =>
        prev.map((p) => (p.id === poll.id ? updatedPoll : p))
      );
      const message = updatedPoll.isPublished ? 'Poll published' : 'Poll unpublished';
      showToast.success(message);
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || 'Failed to update poll status';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setModeratingPollId(null);
    }
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  const getStatusBadge = (poll) => {
    const expired = isPastDeadline(poll.deadline);
    if (!poll.isPublished) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300">
          Unpublished
        </span>
      );
    }
    if (poll.isLocked || expired) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          Locked
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        Active
      </span>
    );
  };

  if (loading && polls.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton variant="card" count={6} ariaLabel="Loading admin polls data" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" tabIndex={-1}>Admin Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage and monitor your polls</p>
            {!authAPI.isAuthenticated() && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">📌 Login to access full admin features</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {authAPI.isAuthenticated() && (
              <>
                <Link to="/admin/voting-overview" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    View All Votes
                  </Button>
                </Link>
                <Link to="/admin/users" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    User Management
                  </Button>
                </Link>
                <Link to="/admin/analytics" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    Analytics
                  </Button>
                </Link>
                <Link to="/admin/create-poll" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full">
                    + Create New Poll
                  </Button>
                </Link>
              </>
            )}
            {!authAPI.isAuthenticated() && (
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full">
                  Login to Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        {polls.length === 0 ? (
          <EmptyState
            icon="📊"
            title={authAPI.isAuthenticated() ? "No Polls Created Yet" : "No Polls Available"}
            description={authAPI.isAuthenticated() ? "Get started by creating your first poll to gather votes and opinions." : "Login to create and manage polls."}
            actionText={authAPI.isAuthenticated() ? "Create Poll" : "Login"}
            onAction={() => navigate(authAPI.isAuthenticated() ? '/admin/create-poll' : '/login')}
            ariaLabel={authAPI.isAuthenticated() ? "No polls created" : "Login required"}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(poll)}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleBookmarkToggle(poll.id)}
                      className={`p-1 rounded transition-all ${
                        bookmarkedPolls[poll.id]
                          ? 'text-yellow-500'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      aria-label={bookmarkedPolls[poll.id] ? 'Remove from bookmarks' : 'Add to bookmarks'}
                      title={bookmarkedPolls[poll.id] ? 'Remove from bookmarks' : 'Add to bookmarks'}
                    >
                      {bookmarkedPolls[poll.id] ? '⭐' : '☆'}
                    </button>
                    <Link
                      to={`/admin/poll/${poll.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 text-xs font-medium"
                      aria-label={`Edit poll: ${poll.question}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSharePoll(poll)}
                      className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 text-xs font-medium"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span>Share</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePoll(poll.id)}
                      disabled={deletingPollId === poll.id}
                      className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                    >
                      {deletingPollId === poll.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <span className="text-xs text-gray-500">
                      {formatDate(poll.createdAt)}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {poll.question}
                </h3>

                <div className="space-y-2 mb-4">
                  {poll.options.slice(0, 2).map((option) => (
                    <div key={option.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 truncate">{option.text}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{option.votes} votes</span>
                    </div>
                  ))}
                  {poll.options.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{poll.options.length - 2} more options
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-gray-600 dark:text-gray-300">Total Votes:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {getTotalVotes(poll)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-gray-600 dark:text-gray-300">Deadline:</span>
                    <span className="text-gray-900 dark:text-white">
                      {isPastDeadline(poll.deadline) ? (
                        <span className="text-red-600">Expired</span>
                      ) : (
                        getTimeRemaining(poll.deadline)
                      )}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Link
                        to={`/results/${poll.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Results
                        </Button>
                      </Link>
                      <Link
                        to={`/admin/poll/${poll.id}/votes`}
                        className="flex-1"
                      >
                        <Button variant="primary" size="sm" className="w-full">
                          Voting Details
                        </Button>
                      </Link>
                    </div>
                    {authAPI.isAuthenticated() && (
                      <div className="flex gap-2">
                        <Button
                          variant={poll.isPublished ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleTogglePublish(poll)}
                          className="flex-1"
                        >
                          {poll.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <button
                          onClick={() => copyPollLink(poll.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={`Copy link to poll: ${poll.question}`}
                          title="Copy poll link"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Share Poll Modal */}
      <Modal
        isOpen={!!sharePoll}
        onClose={() => setSharePoll(null)}
        title="Share Poll"
      >
        {sharePoll && (
          <div className="py-4">
            <p className="text-gray-700 mb-2 font-semibold">{sharePoll.question}</p>
            <p className="text-gray-700 mb-4">Share this poll with users:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/poll/${sharePoll.id}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button
                variant="primary"
                onClick={() => {
                  const link = `${window.location.origin}/poll/${sharePoll.id}`;
                  navigator.clipboard.writeText(link);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;


