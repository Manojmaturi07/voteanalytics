/* 
 * FEATURES IMPLEMENTATION GUIDE
 * 6 Major Features for VoteAnalytics
 */

// ============================================
// FEATURE 1: POLL CATEGORIES/TAGS
// ============================================
// STATUS: ✅ PARTIALLY COMPLETE
// LOCATION: CreatePoll.jsx already has category & tags fields
// TODO: Add category filtering to UserPolls page

// In UserPolls.jsx, add:
import { useState } from 'react';

const UserPolls = () => {
  const [polls, setPolls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  // Extract unique categories from polls
  const extractCategories = (pollsList) => {
    const cats = new Set(pollsList.map(p => p.category).filter(Boolean));
    setCategories(['All', ...Array.from(cats)]);
  };

  // Filter polls by category
  const filteredPolls = selectedCategory === 'All'
    ? polls
    : polls.filter(p => p.category === selectedCategory);

  return (
    <div>
      {/* Category Filter Bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Display filtered polls */}
      <div className="grid gap-6">
        {filteredPolls.map(poll => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
};

// ============================================
// FEATURE 2: REAL-TIME POLL RESULTS
// ============================================
// STATUS: ✅ PARTIALLY COMPLETE
// LOCATION: PollResults.jsx already has 10s refresh
// ENHANCEMENT: Add manual refresh button + loading indicator

// In PollResults.jsx, add to loadPoll function:
const [lastUpdated, setLastUpdated] = useState(new Date());
const [isRefreshing, setIsRefreshing] = useState(false);

const loadPoll = async () => {
  try {
    setIsRefreshing(true);
    const response = await pollsAPI.getPollResults(pollId);
    setPoll(response.data);
    setLastUpdated(new Date());
    setError('');
  } catch (err) {
    setError(err.message || 'Failed to load poll results.');
  } finally {
    setIsRefreshing(false);
  }
};

// Add button in UI:
<div className="flex items-center gap-2 mb-4">
  <span className="text-sm text-gray-500">
    Last updated: {lastUpdated.toLocaleTimeString()}
  </span>
  <Button 
    onClick={loadPoll}
    disabled={isRefreshing}
    variant="outline"
    size="sm"
  >
    {isRefreshing ? 'Refreshing...' : '🔄 Refresh Now'}
  </Button>
</div>

// ============================================
// FEATURE 3: POLL EXPIRATION DATES
// ============================================
// STATUS: ✅ PARTIALLY COMPLETE
// LOCATION: CreatePoll.jsx has deadline field
// TODO: Add countdown timer and auto-lock logic

// In PollVoting.jsx, add countdown display:
const getTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) return 'Poll has expired';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s remaining`;
};

// Display in UI:
const [timeRemaining, setTimeRemaining] = useState('');

useEffect(() => {
  if (!poll) return;

  const updateTimer = () => {
    setTimeRemaining(getTimeRemaining(poll.deadline));
    
    // Auto-redirect if expired
    if (isPastDeadline(poll.deadline)) {
      showToast.info('Poll has expired');
      navigate(`/results/${pollId}`);
    }
  };

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [poll]);

// Show countdown in voting form:
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
  <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
    ⏰ Time Remaining: {timeRemaining}
  </p>
</div>

// ============================================
// FEATURE 4: ANONYMOUS VOTING
// ============================================
// STATUS: ❌ NOT YET IMPLEMENTED
// TODO: Add anonymous toggle to CreatePoll form

// Add to CreatePoll form state:
const [formData, setFormData] = useState({
  question: '',
  options: ['', ''],
  deadline: '',
  category: '',
  tags: '',
  isAnonymous: false, // NEW
});

// Add UI toggle in CreatePoll form:
<div className="flex items-center gap-3">
  <input
    type="checkbox"
    id="isAnonymous"
    checked={formData.isAnonymous}
    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
    className="w-4 h-4 cursor-pointer"
  />
  <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
    Anonymous Voting
    <span className="text-gray-500 font-normal ml-2">(Don't show voter names in results)</span>
  </label>
</div>

// In PollVotingDetails.jsx, hide voter names when anonymous:
{!poll.isAnonymous && (
  <p className="text-xs text-gray-600 dark:text-gray-400">
    Voted by: {voter.username}
  </p>
)}

// ============================================
// FEATURE 5: POLL COMMENTS
// ============================================
// STATUS: ❌ NOT YET IMPLEMENTED
// TODO: Create Comments component

// NEW FILE: src/components/Comments.jsx
import { useState, useEffect } from 'react';
import Button from './Button.jsx';
import Card from './Card.jsx';

const Comments = ({ pollId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // Save comment to localStorage (or API)
      const comment = {
        id: Date.now(),
        text: newComment,
        author: authAPI.getCurrentUser()?.username || 'Anonymous',
        timestamp: new Date().toISOString(),
      };
      
      const storageKey = `poll_${pollId}_comments`;
      const existingComments = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existingComments, comment]));
      
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💬 Discussion ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this poll..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          rows="3"
        />
        <Button
          onClick={handleSubmitComment}
          disabled={loading || !newComment.trim()}
          variant="primary"
          size="sm"
          className="mt-2"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.author}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </Card>
  );
};

export default Comments;

// Add to PollResults.jsx:
<Comments pollId={pollId} />

// ============================================
// FEATURE 6: BOOKMARK POLLS
// ============================================
// STATUS: ❌ NOT YET IMPLEMENTED
// TODO: Add bookmark functionality

// NEW FILE: src/utils/bookmarkUtils.js
export const bookmarkUtils = {
  addBookmark: (pollId) => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
    if (!bookmarks.includes(pollId)) {
      bookmarks.push(pollId);
      localStorage.setItem('bookmarked_polls', JSON.stringify(bookmarks));
    }
  },

  removeBookmark: (pollId) => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
    const filtered = bookmarks.filter(id => id !== pollId);
    localStorage.setItem('bookmarked_polls', JSON.stringify(filtered));
  },

  isBookmarked: (pollId) => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
    return bookmarks.includes(pollId);
  },

  getBookmarks: () => {
    return JSON.parse(localStorage.getItem('bookmarked_polls') || '[]');
  },
};

// Add bookmark button to poll cards:
import { bookmarkUtils } from '../utils/bookmarkUtils.js';

const [isBookmarked, setIsBookmarked] = useState(false);

useEffect(() => {
  setIsBookmarked(bookmarkUtils.isBookmarked(poll.id));
}, [poll.id]);

const handleToggleBookmark = () => {
  if (isBookmarked) {
    bookmarkUtils.removeBookmark(poll.id);
    showToast.info('Removed from bookmarks');
  } else {
    bookmarkUtils.addBookmark(poll.id);
    showToast.success('Added to bookmarks');
  }
  setIsBookmarked(!isBookmarked);
};

// Add button in UI:
<Button
  onClick={handleToggleBookmark}
  variant={isBookmarked ? 'primary' : 'outline'}
  size="sm"
  ariaLabel={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
>
  {isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
</Button>

// Create bookmarked polls page:
// NEW FILE: src/pages/BookmarkedPolls.jsx
import { useState, useEffect } from 'react';
import { pollsAPI } from '../services/api.js';
import { bookmarkUtils } from '../utils/bookmarkUtils.js';
import PollCard from '../components/PollCard.jsx';

const BookmarkedPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedPolls();
  }, []);

  const loadBookmarkedPolls = async () => {
    try {
      const bookmarkIds = bookmarkUtils.getBookmarks();
      
      if (bookmarkIds.length === 0) {
        setPolls([]);
        return;
      }

      // Fetch all bookmarked polls
      const pollsData = await Promise.all(
        bookmarkIds.map(id => 
          pollsAPI.getPollById(id).catch(() => null)
        )
      );

      setPolls(pollsData.filter(p => p !== null).map(p => p.data));
    } catch (err) {
      console.error('Failed to load bookmarked polls:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading bookmarked polls...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📚 My Bookmarked Polls</h1>
      
      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No bookmarked polls yet</p>
          <Link to="/polls">Browse Polls</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {polls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedPolls;

// Add route in App.jsx:
<Route path="/bookmarks" element={<UserProtectedRoute><BookmarkedPolls /></UserProtectedRoute>} />

// Add link in Navbar:
<Link to="/bookmarks" className="...">
  📚 My Bookmarks
</Link>
