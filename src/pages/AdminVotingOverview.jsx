import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { formatDate } from '../utils/helpers.js';

const AdminVotingOverview = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [allVotes, setAllVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('byPoll'); // 'byPoll' or 'byUser'

  useEffect(() => {
    // Check authentication
    if (!authAPI.isAdmin()) {
      navigate('/login?type=admin');
      return;
    }

    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const pollsResponse = await pollsAPI.getAllPolls();
      setPolls(pollsResponse.data);

      // Load votes for all polls
      const votesPromises = pollsResponse.data.map(poll => 
        pollsAPI.getPollVotingDetails(poll.id).catch(() => ({ data: [] }))
      );
      const votesResponses = await Promise.all(votesPromises);
      
      // Combine all votes with poll information
      const combinedVotes = [];
      pollsResponse.data.forEach((poll, index) => {
        const pollVotes = votesResponses[index].data || [];
        pollVotes.forEach(vote => {
          combinedVotes.push({
            ...vote,
            pollId: poll.id,
            pollQuestion: poll.question,
          });
        });
      });

      setAllVotes(combinedVotes);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load voting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group votes by poll
  const getVotesByPoll = () => {
    const grouped = {};
    polls.forEach(poll => {
      grouped[poll.id] = {
        poll,
        votes: allVotes.filter(vote => vote.pollId === poll.id),
      };
    });
    return grouped;
  };

  // Group votes by user
  const getVotesByUser = () => {
    const grouped = {};
    allVotes.forEach(vote => {
      const userId = vote.userId;
      if (!grouped[userId]) {
        grouped[userId] = {
          userId,
          username: vote.username,
          name: vote.name,
          votes: [],
        };
      }
      grouped[userId].votes.push(vote);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading voting overview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && polls.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isAdmin={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Button onClick={() => navigate('/admin/dashboard')} variant="primary">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const votesByPoll = getVotesByPoll();
  const votesByUser = getVotesByUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Voting Overview</h1>
              <p className="text-gray-600 dark:text-gray-300">Complete voting information across all polls</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'byPoll' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('byPoll')}
              >
                View by Poll
              </Button>
              <Button
                variant={viewMode === 'byUser' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('byUser')}
              >
                View by User
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Polls</p>
              <p className="text-2xl font-bold text-indigo-600">{polls.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-indigo-600">{allVotes.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-indigo-600">{Object.keys(votesByUser).length}</p>
            </div>
          </div>
        </Card>

        {viewMode === 'byPoll' ? (
          <div className="space-y-6">
            {polls.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-500">No polls available</p>
                </div>
              </Card>
            ) : (
              polls.map((poll) => {
                const pollVotes = votesByPoll[poll.id]?.votes || [];
                return (
                  <Card key={poll.id}>
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {poll.question}
                          </h2>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                            <span>Created: {formatDate(poll.createdAt)}</span>
                            <span>Deadline: {formatDate(poll.deadline)}</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {pollVotes.length} vote{pollVotes.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <Link to={`/admin/poll/${poll.id}/votes`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {pollVotes.length === 0 ? (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 text-center py-4">
                          No votes recorded for this poll yet.
                        </p>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Votes ({pollVotes.length}):
                        </h3>
                        <div className="space-y-2">
                          {pollVotes.map((vote, index) => {
                            const option = poll.options.find(opt => opt.id === vote.optionId);
                            return (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 font-semibold">
                                      {vote.name ? vote.name.charAt(0).toUpperCase() : vote.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {vote.name || vote.username}
                                    </p>
                                    <p className="text-sm text-gray-500">@{vote.username}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      Voted for: <span className="text-indigo-600 dark:text-indigo-400">{option?.text || vote.optionText}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(vote.votedAt)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(votesByUser).length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-500">No user votes recorded</p>
                </div>
              </Card>
            ) : (
              Object.values(votesByUser)
                .sort((a, b) => b.votes.length - a.votes.length)
                .map((userData) => (
                  <Card key={userData.userId}>
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-lg">
                            {userData.name ? userData.name.charAt(0).toUpperCase() : userData.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {userData.name || userData.username}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">@{userData.username}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {userData.votes.length} vote{userData.votes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Voting History:</h3>
                      <div className="space-y-3">
                        {userData.votes.map((vote, index) => {
                          const poll = polls.find(p => p.id === vote.pollId);
                          return (
                            <div
                              key={index}
                              className="p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                                    {vote.pollQuestion}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    Voted for: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{vote.optionText}</span>
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(vote.votedAt)}
                                  </p>
                                </div>
                                <Link to={`/admin/poll/${vote.pollId}/votes`}>
                                  <Button variant="outline" size="sm">
                                    View Poll
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            onClick={loadAllData}
            className="w-full"
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminVotingOverview;

