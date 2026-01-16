import { useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';
import Button from './Button.jsx';
import Card from './Card.jsx';
import { showToast } from '../utils/toastConfig.js';

/**
 * Comments Component
 * 
 * Allows users to discuss and comment on polls
 * Comments are stored in localStorage (can be migrated to backend)
 * 
 * @component
 * @param {string} pollId - The ID of the poll
 * @example
 * <Comments pollId={pollId} />
 */
const Comments = ({ pollId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [pollId]);

  const loadComments = () => {
    try {
      setCommentsLoading(true);
      const storageKey = `poll_${pollId}_comments`;
      const stored = localStorage.getItem(storageKey);
      const loadedComments = stored ? JSON.parse(stored) : [];
      // Sort by newest first
      loadedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(loadedComments);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      showToast.warning('Please enter a comment');
      return;
    }

    if (!authAPI.isUser()) {
      showToast.warning('Please log in to comment');
      return;
    }

    setLoading(true);
    try {
      const currentUser = authAPI.getCurrentUser();
      const comment = {
        id: Date.now(),
        text: newComment.trim(),
        author: currentUser?.name || currentUser?.username || 'Anonymous',
        username: currentUser?.username || 'anonymous',
        timestamp: new Date().toISOString(),
        likes: 0,
      };

      const storageKey = `poll_${pollId}_comments`;
      const existingComments = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedComments = [comment, ...existingComments];
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));

      setComments(updatedComments);
      setNewComment('');
      showToast.success('Comment posted!');
    } catch (err) {
      console.error('Failed to post comment:', err);
      showToast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const storageKey = `poll_${pollId}_comments`;
      const updatedComments = comments.filter(c => c.id !== commentId);
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));
      setComments(updatedComments);
      showToast.success('Comment deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      showToast.error('Failed to delete comment');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const currentUser = authAPI.getCurrentUser();

  return (
    <Card className="mt-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          💬 Discussion
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </p>
      </div>

      {/* Comment Form */}
      {authAPI.isUser() ? (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Share your thoughts about this poll
          </p>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            rows="3"
            maxLength="500"
            aria-label="Write a comment"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              {newComment.length}/500
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={loading || !newComment.trim()}
              variant="primary"
              size="sm"
              ariaLabel="Post comment"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📝 <a href="/login?type=user" className="font-semibold hover:underline">
              Log in
            </a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      {commentsLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {comment.author}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.timestamp)}
                  </p>
                </div>
                {currentUser?.username === comment.username && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
                    aria-label="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm break-words">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Comments;
