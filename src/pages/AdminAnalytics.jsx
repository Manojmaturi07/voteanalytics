import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI, usersAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    completedPolls: 0,
    totalUsers: 0,
  });
  const [popularPolls, setPopularPolls] = useState([]);
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    if (!authAPI.isAdmin()) {
      navigate('/login?type=admin');
      return;
    }
    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load polls and users
      const [pollsResponse, usersResponse] = await Promise.all([
        pollsAPI.getAllPolls(),
        usersAPI.getAllUsers().catch(() => ({ data: [] })), // Gracefully handle if usersAPI fails
      ]);

      const polls = pollsResponse.data || [];
      const users = usersResponse.data || [];

      // Calculate statistics
      const totalVotes = polls.reduce((sum, poll) => {
        return sum + (poll.options || []).reduce((s, opt) => s + (opt.votes || 0), 0);
      }, 0);

      const activePolls = polls.filter(p => !p.isLocked && new Date(p.deadline) > new Date()).length;
      const completedPolls = polls.filter(p => p.isLocked || new Date(p.deadline) <= new Date()).length;

      // Get popular polls (top 5 by votes)
      const pollsWithVotes = polls.map(poll => ({
        ...poll,
        totalVotes: (poll.options || []).reduce((sum, opt) => sum + (opt.votes || 0), 0),
      })).sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 5);

      // Category distribution
      const categoryCounts = {};
      polls.forEach(poll => {
        const category = poll.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const categoryLabels = Object.keys(categoryCounts);
      const categoryValues = Object.values(categoryCounts);

      setStats({
        totalPolls: polls.length,
        totalVotes,
        activePolls,
        completedPolls,
        totalUsers: users.length,
      });

      setPopularPolls(pollsWithVotes);

      if (categoryLabels.length > 0) {
        setCategoryData({
          labels: categoryLabels,
          datasets: [{
            label: 'Polls by Category',
            data: categoryValues,
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(34, 197, 94, 0.8)',
            ],
            borderColor: [
              'rgba(99, 102, 241, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(236, 72, 153, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(34, 197, 94, 1)',
            ],
            borderWidth: 2,
          }],
        });
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner size="lg" text="Loading analytics..." ariaLabel="Loading analytics data" />
        </div>
      </div>
    );
  }

  const popularPollsChartData = popularPolls.length > 0 ? {
    labels: popularPolls.map(p => p.question.substring(0, 30) + (p.question.length > 30 ? '...' : '')),
    datasets: [{
      label: 'Total Votes',
      data: popularPolls.map(p => p.totalVotes),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
    }],
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of polls, votes, and user engagement
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="p-6">
              <p className="text-indigo-100 text-sm font-medium mb-1">Total Polls</p>
              <p className="text-3xl font-bold">{stats.totalPolls}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <p className="text-purple-100 text-sm font-medium mb-1">Total Votes</p>
              <p className="text-3xl font-bold">{stats.totalVotes}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="p-6">
              <p className="text-green-100 text-sm font-medium mb-1">Active Polls</p>
              <p className="text-3xl font-bold">{stats.activePolls}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <p className="text-blue-100 text-sm font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold">{stats.completedPolls}</p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="p-6">
              <p className="text-pink-100 text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Polls Chart */}
          {popularPollsChartData && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Most Popular Polls
              </h2>
              <div className="h-64">
                <Bar
                  data={popularPollsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.parsed.y} votes`,
                        },
                      },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              </div>
            </Card>
          )}

          {/* Category Distribution */}
          {categoryData && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Polls by Category
              </h2>
              <div className="h-64">
                <Pie
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Popular Polls List */}
        {popularPolls.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top 5 Most Popular Polls
            </h2>
            <div className="space-y-4">
              {popularPolls.map((poll, index) => (
                <div
                  key={poll.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {poll.question}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {poll.totalVotes} votes
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/results/${poll.id}`}
                    className="ml-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    View Results →
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;

