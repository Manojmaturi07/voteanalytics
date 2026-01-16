import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsAPI, authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { showToast } from '../utils/toastConfig.js';

const CreatePoll = () => {
  const [formData, setFormData] = useState({
    question: '',
    options: ['', ''],
    deadline: '',
    category: '',
    tags: '',
    isAnonymous: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleQuestionChange = (e) => {
    setFormData({ ...formData, question: e.target.value });
    setError('');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
    setError('');
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleDeadlineChange = (e) => {
    setFormData({ ...formData, deadline: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.question.trim()) {
      const msg = 'Please enter a poll question';
      setError(msg);
      showToast.warning(msg);
      return;
    }

    const validOptions = formData.options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      const msg = 'Please provide at least 2 options';
      setError(msg);
      showToast.warning(msg);
      return;
    }

    if (!formData.deadline) {
      const msg = 'Please set a deadline for the poll';
      setError(msg);
      showToast.warning(msg);
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < new Date()) {
      const msg = 'Deadline must be in the future';
      setError(msg);
      showToast.warning(msg);
      return;
    }

    setLoading(true);
    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const newPoll = await pollsAPI.createPoll({
        question: formData.question.trim(),
        options: validOptions,
        deadline: formData.deadline,
        category: formData.category.trim() || null,
        tags: tagsArray,
      });
      showToast.success('Poll created successfully! 🎉');
      
      // Send email notifications (async, don't wait for it)
      getAllUserEmails().then(emails => {
        notifyNewPoll(newPoll.data, emails).catch(err => {
          console.warn('Failed to send email notifications:', err);
        });
      }).catch(err => {
        console.warn('Failed to get user emails:', err);
      });
      
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Failed to create poll. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={true} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" tabIndex={-1}>Create New Poll</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Set up a new voting poll for your audience</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start" role="alert">
                <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poll Question <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="question"
                value={formData.question}
                onChange={handleQuestionChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g., What is your favorite programming language?"
                required
                aria-required="true"
                aria-label="Poll question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poll Options <span className="text-red-500" aria-label="required">*</span>
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                  (Minimum 2, Maximum 10)
                </span>
              </label>
              <div className="space-y-3" role="group" aria-label="Poll options">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder={`Option ${index + 1}`}
                      aria-label={`Option ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Remove option ${index + 1}`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                  aria-label="Add another poll option"
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Option
                </button>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Technology, Sports, Food"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                aria-label="Poll category"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags <span className="text-gray-500 font-normal">(Optional, comma-separated)</span>
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., programming, web, frontend"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                aria-label="Poll tags"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poll Deadline <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={formData.deadline}
                onChange={handleDeadlineChange}
                min={getMinDateTime()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
                aria-required="true"
                aria-label="Poll deadline"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The poll will automatically lock after this date and time
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="w-4 h-4 cursor-pointer accent-indigo-600"
                aria-label="Enable anonymous voting"
              />
              <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                🔒 Anonymous Voting
                <span className="text-gray-500 dark:text-gray-400 font-normal block text-xs mt-1">
                  Don't show voter names in results. Voters remain completely anonymous.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 flex items-center justify-center"
                aria-busy={loading}
                aria-label={loading ? 'Creating poll' : 'Create poll'}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePoll;

