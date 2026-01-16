import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { formatDate, getTimeRemaining, isPastDeadline } from '../utils/helpers.js';
import { showToast } from '../utils/toastConfig.js';
import { triggerBurstConfetti } from '../utils/confettiUtils.js';

const PollVoting = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Load poll data when component mounts or pollId changes
    // Note: We intentionally do NOT force user login here so that shared links
    // can be opened by anyone. Voting permissions are still enforced in the
    // submit handler and API layer.
    loadPoll();
  }, [pollId, navigate]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const response = await pollsAPI.getPollById(pollId);
      const pollData = response.data;

      // Check if user has already voted
      const voted = pollsAPI.hasVoted(pollId);
      setHasVoted(voted);

      // Check if poll is locked or expired
      if (pollData.isLocked || isPastDeadline(pollData.deadline)) {
        navigate(`/results/${pollId}`);
        return;
      }

      setPoll(pollData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId) => {
    if (!hasVoted && !submitting) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedOption) {
      setError('Please select an option before voting');
      return;
    }

    // Check if user is logged in
    if (!authAPI.isUser()) {
      setError('You must be logged in to vote. Redirecting to login...');
      showToast.warning('Please log in to vote');
      setTimeout(() => {
        navigate('/login?type=user');
      }, 2000);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await pollsAPI.submitVote(pollId, selectedOption);
      setHasVoted(true);
      
      // Trigger confetti animation
      triggerBurstConfetti();
      
      // Show success toast
      showToast.success('Your vote has been recorded! 🎉');
      
      setShowSuccessModal(true);
      // Reload poll to get updated vote counts
      await loadPoll();
    } catch (err) {
      const errorMsg = err.message || 'Failed to submit vote. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    setShowSuccessModal(false);
    navigate(`/results/${pollId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner size="lg" text="Loading poll..." ariaLabel="Loading poll data" />
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
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

  const expired = isPastDeadline(poll.deadline);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" tabIndex={-1}>
                  {poll.question}
                </h1>
                <p className="text-gray-600 dark:text-gray-300" aria-live="polite">
                  Deadline: {formatDate(poll.deadline)}
                </p>
              </div>
            </div>

            {!expired && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4" role="status" aria-label="Time remaining">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Deadline: {formatDate(poll.deadline)}
                </p>
              </div>
            )}

            {expired && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                  This poll has expired. View results below.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {hasVoted ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    Thank you! Your vote has been recorded.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {poll.options.map((option) => {
                  const totalVotes = poll.options.reduce(
                    (sum, opt) => sum + opt.votes,
                    0
                  );
                  const percentage =
                    totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;

                  return (
                    <div key={option.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex space-x-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleViewResults}
                  className="flex-1"
                >
                  View Full Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={expired || submitting}
                    className={`w-full text-left p-4 border-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                      selectedOption === option.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } ${
                      expired || submitting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                    role="radio"
                    aria-checked={selectedOption === option.id}
                    aria-label={option.text}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          selectedOption === option.id
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {selectedOption === option.id && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitVote}
                  disabled={!selectedOption || submitting || expired}
                  className="w-full flex items-center justify-center"
                  aria-busy={submitting}
                  aria-label={submitting ? 'Submitting your vote' : 'Submit your vote'}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Vote'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleViewResults}
        title="Vote Submitted Successfully!"
      >
        <div className="text-center py-6 px-2">
          <svg
            className="mx-auto h-20 w-20 text-green-500 dark:text-green-400 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Thank You! 🎉
          </p>
          <p className="text-base text-gray-700 dark:text-gray-100 mb-8 leading-relaxed">
            Your vote has been recorded successfully. You can now view the results and see how others voted.
          </p>
          <Button variant="primary" onClick={handleViewResults} className="w-full py-3 text-base font-semibold">
            View Results
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default PollVoting;


