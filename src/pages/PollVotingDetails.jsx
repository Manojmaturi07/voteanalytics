import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { formatDate } from '../utils/helpers.js';

const PollVotingDetails = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAdmin()) {
      navigate('/login?type=admin');
      return;
    }

    loadPollAndVotes();
  }, [pollId, navigate]);

  const loadPollAndVotes = async () => {
    try {
      setLoading(true);
      const pollResponse = await pollsAPI.getPollById(pollId);
      const votesResponse = await pollsAPI.getPollVotingDetails(pollId);
      
      setPoll(pollResponse.data);
      setVotes(votesResponse.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load voting details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVotesByOption = (optionId) => {
    return votes.filter(vote => vote.optionId === optionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading voting details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
              <Button onClick={() => navigate('/admin/dashboard')} variant="primary">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting Details</h1>
          <p className="text-gray-600">See who voted for which option</p>
        </div>

        <Card className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{poll.question}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Created: {formatDate(poll.createdAt)}</span>
              <span>Deadline: {formatDate(poll.deadline)}</span>
              <span className="font-semibold text-indigo-600">Total Votes: {votes.length}</span>
            </div>
          </div>
        </Card>

        {votes.length === 0 ? (
          <Card>
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No votes yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No users have voted on this poll yet.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {poll.options.map((option) => {
              const optionVotes = getVotesByOption(option.id);
              const percentage = votes.length > 0 ? ((optionVotes.length / votes.length) * 100).toFixed(1) : 0;

              return (
                <Card key={option.id}>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{option.text}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{optionVotes.length}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                          vote{optionVotes.length !== 1 ? 's' : ''} ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {optionVotes.length > 0 ? (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Users who voted for this option ({optionVotes.length}):
                      </h4>
                      <div className="space-y-2">
                        {optionVotes.map((vote, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                  {vote.name ? vote.name.charAt(0).toUpperCase() : vote.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {vote.name || vote.username}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">@{vote.username}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{formatDate(vote.votedAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-500 text-center py-2">
                        No users have voted for this option yet.
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          <Link to={`/results/${pollId}`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              View Results
            </Button>
          </Link>
          <Button
            variant="primary"
            size="lg"
            onClick={loadPollAndVotes}
            className="flex-1"
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollVotingDetails;

