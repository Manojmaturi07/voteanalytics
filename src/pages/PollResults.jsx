import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { formatDate, getTimeRemaining, isPastDeadline } from '../utils/helpers.js';
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import { showToast } from '../utils/toastConfig.js';
import Comments from '../components/Comments.jsx';
import * as bookmarkUtils from '../utils/bookmarkUtils.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PollResults = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    loadPoll();
    // Refresh results every 10 seconds for real-time updates
    const interval = setInterval(loadPoll, 10000);
    return () => clearInterval(interval);
  }, [pollId]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getPollResults(pollId);
      setPoll(response.data);
      setIsBookmarked(bookmarkUtils.isBookmarked(pollId));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load poll results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((sum, option) => sum + option.votes, 0);
  };

  const handleBookmarkToggle = () => {
    bookmarkUtils.toggleBookmark(pollId);
    setIsBookmarked(!isBookmarked);
    showToast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const getChartData = () => {
    if (!poll) return null;

    const labels = poll.options.map((opt) => opt.text);
    const votes = poll.options.map((opt) => opt.votes);
    const total = getTotalVotes();

    const backgroundColors = [
      'rgba(99, 102, 241, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(16, 185, 129, 0.8)',
    ];

    const borderColors = backgroundColors.map((color) =>
      color.replace('0.8', '1')
    );

    if (chartType === 'bar') {
      return {
        labels,
        datasets: [
          {
            label: 'Votes',
            data: votes,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 2,
          },
        ],
      };
    } else {
      return {
        labels,
        datasets: [
          {
            label: 'Votes',
            data: votes,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Poll Results',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = getTotalVotes();
            const percentage =
              total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed.y} votes (${percentage}%)`;
          },
        },
      },
    },
    scales:
      chartType === 'bar'
        ? {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          }
        : undefined,
  };

  if (loading && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={authAPI.isAdmin()} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSkeleton variant="poll-list" count={4} ariaLabel="Loading poll results" />
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={authAPI.isAdmin()} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
              <Button onClick={() => navigate('/')} variant="primary">
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = getTotalVotes();
  const expired = isPastDeadline(poll.deadline);
  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={authAPI.isAdmin()} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {poll.question}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {expired ? (
                    <span className="text-red-600 font-semibold">Poll Closed</span>
                  ) : (
                    <span>Deadline: {formatDate(poll.deadline)}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-2 rounded-lg transition-all ${
                    isBookmarked
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                  {isBookmarked ? '⭐' : '☆'}
                </button>
                <Button
                  variant={chartType === 'bar' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  Bar Chart
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  Pie Chart
                </Button>
                {authAPI.isAdmin() && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          exportToCSV(poll, pollId);
                          showToast.success('Results exported as CSV');
                        } catch (err) {
                          showToast.error('Failed to export CSV');
                        }
                      }}
                      aria-label="Export results as CSV"
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await exportToPDF(poll, pollId);
                          showToast.success('Results exported as PDF');
                        } catch (err) {
                          showToast.error('Failed to export PDF');
                        }
                      }}
                      aria-label="Export results as PDF"
                    >
                      Export PDF
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">Total Votes</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totalVotes}</p>
                </div>
                {!expired && (
                  <div className="text-right">
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">Time Remaining</p>
                    <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                      {getTimeRemaining(poll.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {totalVotes === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No votes yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Be the first to vote on this poll!
              </p>
              <div className="mt-6">
                <Link to={`/poll/${pollId}`}>
                  <Button variant="primary">Vote Now</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="mb-8">
                <div className="h-96">
                  {chartData && chartType === 'bar' ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <Pie data={chartData} options={chartOptions} />
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Detailed Results
                </h2>
                {poll.options
                  .sort((a, b) => b.votes - a.votes)
                  .map((option, index) => {
                    const percentage =
                      totalVotes > 0
                        ? ((option.votes / totalVotes) * 100).toFixed(1)
                        : 0;
                    const isWinner = index === 0 && option.votes > 0;

                    return (
                      <div
                        key={option.id}
                        className={`border rounded-md p-4 ${
                          isWinner
                            ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {index + 1}. {option.text}
                            </span>
                            {isWinner && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                                Leading
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {option.votes}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 ml-2">
                              vote{option.votes !== 1 ? 's' : ''} ({percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isWinner ? 'bg-green-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discussion</h2>
            <Comments pollId={pollId} />
          </div>

          <div className="mt-8 flex space-x-4">
            <Link to={`/poll/${pollId}`} className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                {expired ? 'View Poll' : 'Back to Poll'}
              </Button>
            </Link>
            <Button
              variant="primary"
              size="lg"
              onClick={loadPoll}
              className="flex-1"
            >
              Refresh Results
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PollResults;


