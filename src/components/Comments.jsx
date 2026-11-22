import { useState, useEffect } from 'react';
import { authAPI, commentsAPI } from '../services/api.js';
import Button from './Button.jsx';
import Card from './Card.jsx';
import { showToast } from '../utils/toastConfig.js';

/**
 * Comments Component
 * Connects with backend comments API with graceful offline fallback
 */
const Comments = ({ pollId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [pollId]);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await commentsAPI.getComments(pollId).catch(() => null);
      if (res && res.data) {
        setComments(res.data);
      } else {
        // Fallback to local storage
        const storageKey = `poll_${pollId}_comments`;
        const stored = localStorage.getItem(storageKey);
        const loadedComments = stored ? JSON.parse(stored) : [];
        loadedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setComments(loadedComments);
      }
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

    if (!authAPI.isAuthenticated()) {
      showToast.warning('Please log in to comment');
      return;
    }

    setLoading(true);
    try {
      const res = await commentsAPI.addComment(pollId, newComment.trim()).catch(() => null);
      if (res && res.data) {
        setComments([res.data, ...comments]);
      } else {
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
        const updated = [comment, ...existingComments];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setComments(updated);
      }

      setNewComment('');
      showToast.success('Comment posted!');
    } catch (err) {
      console.error('Failed to post comment:', err);
      showToast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await commentsAPI.deleteComment(commentId).catch(() => {});
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Discussion ({comments.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your thoughts and discuss this poll with the community
        </p>
      </div>

      {authAPI.isAuthenticated() ? (
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={loading || !newComment.trim()}
                  variant="primary"
                  size="sm"
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please log in to join the discussion
          </p>
        </div>
      )}

      {commentsLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {comment.author?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.author}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.timestamp)}
                    </span>
                  </div>
                </div>
                {(currentUser?.username === comment.username || authAPI.isAdmin()) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-600 text-xs transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
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
