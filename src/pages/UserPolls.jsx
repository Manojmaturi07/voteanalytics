import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, getTimeRemaining, isPastDeadline } from '../utils/helpers.js';
import { showToast } from '../utils/toastConfig.js';

const UserPolls = () => {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pollsPerPage] = useState(9); // 3x3 grid
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!authAPI.isUser()) {
      navigate('/login?type=user');
      return;
    }

    loadPolls();
  }, [navigate]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError('');
      // Get all polls (we'll filter active ones for users)
      const response = await pollsAPI.getAllPolls();
      // Filter to show only active polls (not locked and not expired)
      const activePolls = response.data.filter(poll => {
        const expired = isPastDeadline(poll.deadline);
        return !poll.isLocked && !expired;
      });
      setPolls(activePolls);
      setFilteredPolls(activePolls);
    } catch (err) {
      const errorMsg = 'Failed to load polls. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search polls
  useEffect(() => {
    let filtered = [...polls];

    // Search by question/title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(poll => 
        poll.question.toLowerCase().includes(query) ||
        (poll.category && poll.category.toLowerCase().includes(query)) ||
        (poll.tags && poll.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(poll => 
        poll.category === selectedCategory
      );
    }

    // Filter by date
    if (selectedDateFilter) {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, todayStart.getDate());

      filtered = filtered.filter(poll => {
        const pollDate = new Date(poll.createdAt);
        const pollDateStart = new Date(pollDate.getFullYear(), pollDate.getMonth(), pollDate.getDate());

        switch (selectedDateFilter) {
          case 'today':
            return pollDateStart.getTime() === todayStart.getTime();
          case 'week':
            return pollDate >= weekAgo;
          case 'month':
            return pollDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredPolls(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategory, selectedDateFilter, polls]);

  // Get unique categories from polls
  const categories = [...new Set(polls.map(poll => poll.category).filter(Boolean))];

  // Pagination calculations
  const indexOfLastPoll = currentPage * pollsPerPage;
  const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
  const currentPolls = filteredPolls.slice(indexOfFirstPoll, indexOfLastPoll);
  const totalPages = Math.ceil(filteredPolls.length / pollsPerPage);

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  const hasUserVoted = (pollId) => {
    return pollsAPI.hasVoted(pollId);
  };

  const copyPollLink = (pollId) => {
    const pollUrl = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(pollUrl).then(() => {
      showToast.success('Poll link copied to clipboard!');
    }).catch(() => {
      showToast.error('Failed to copy link');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Available Polls</h1>
            <p className="text-gray-600 dark:text-gray-400">Vote on active polls and participate in decision-making</p>
          </div>
          <LoadingSkeleton variant="card" count={6} ariaLabel="Loading available polls" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>Available Polls</h1>
          <p className="text-gray-600 dark:text-gray-400">Vote on active polls and participate in decision-making</p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search polls</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search polls by title, category, or tags..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Search polls"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="sm:w-40">
              <label htmlFor="date-filter" className="sr-only">Filter by date</label>
              <select
                id="date-filter"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Filter by date"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="sm:w-48">
                <label htmlFor="category" className="sr-only">Filter by category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results count */}
          {filteredPolls.length !== polls.length && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredPolls.length} of {polls.length} polls
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-start" role="alert">
            <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!polls || polls.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Active Polls Available"
            description="There are no active polls to vote on at the moment. Check back soon for new polls!"
            ariaLabel="No active polls available"
          />
        ) : filteredPolls.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Polls Found"
            description={searchQuery || selectedCategory 
              ? "No polls match your search criteria. Try adjusting your filters."
              : "There are no active polls to vote on at the moment. Check back soon for new polls!"}
            ariaLabel="No polls found"
          />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentPolls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const voted = hasUserVoted(poll.id);
              const timeRemaining = getTimeRemaining(poll.deadline);

              return (
                <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    {voted && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Voted
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" aria-label="Poll is active">
                      Active
                    </span>
                    {voted && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" aria-label="You have already voted on this poll">
                        Voted
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1" tabIndex={-1}>
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

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{poll.options.length}</span> options
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{totalVotes}</span> total votes
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Time left:</span> <span aria-live="polite">{timeRemaining}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-col gap-2">
                      {/* Main action button */}
                      <div className="flex space-x-2">
                        {voted ? (
                          <Link
                            to={`/results/${poll.id}`}
                            className="flex-1"
                            aria-label={`View results for poll: ${poll.question}`}
                          >
                            <Button variant="primary" size="sm" className="w-full">
                              View Results
                            </Button>
                          </Link>
                        ) : (
                          <Link
                            to={`/poll/${poll.id}`}
                            className="flex-1"
                            aria-label={`Vote on poll: ${poll.question}`}
                          >
                            <Button variant="secondary" size="sm" className="w-full">
                              Vote Now
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Copy link button */}
                      <button
                        onClick={() => copyPollLink(poll.id)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={`Copy link to poll: ${poll.question}`}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                </Card>
              );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2" role="navigation" aria-label="Pagination">
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
    </div>
  );
};

export default UserPolls;

