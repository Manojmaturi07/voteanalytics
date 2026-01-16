import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { authAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to polls page
    if (authAPI.isUser()) {
      navigate('/polls');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">
            Welcome to VoteAnalytics
          </h1>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto dark:text-indigo-200">
            Create polls, collect votes, and analyze results in real-time. The modern platform for democratic decision-making and opinion gathering.
          </p>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto dark:text-indigo-300">
            Whether you're conducting surveys, gathering feedback, making team decisions, or running elections, VoteAnalytics provides a secure, user-friendly solution for all your voting needs.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center bg-white dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-purple-900/40 dark:border-indigo-700/50 dark:backdrop-blur hover:dark:shadow-lg hover:dark:shadow-indigo-500/20 transition-all">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-300"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-indigo-100 mb-2">
              Create Polls
            </h3>
            <p className="text-gray-600 dark:text-indigo-200">
              Easily create custom polls with multiple options (2-10 choices), set custom deadlines, and manage all your polls from one dashboard. Perfect for surveys, elections, and decision-making.
            </p>
          </Card>

          <Card className="text-center bg-white dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-pink-900/40 dark:border-purple-700/50 dark:backdrop-blur hover:dark:shadow-lg hover:dark:shadow-purple-500/20 transition-all">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-indigo-600 dark:text-purple-300"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-purple-100 mb-2">
              Real-time Results
            </h3>
            <p className="text-gray-600 dark:text-purple-200">
              View live vote counts and visualize results with interactive bar and pie charts. See percentages, vote counts, and leading options updated in real-time as votes come in.
            </p>
          </Card>

          <Card className="text-center bg-white dark:bg-gradient-to-br dark:from-pink-900/40 dark:to-indigo-900/40 dark:border-pink-700/50 dark:backdrop-blur hover:dark:shadow-lg hover:dark:shadow-pink-500/20 transition-all">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-indigo-600 dark:text-pink-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-pink-100 mb-2">
              Secure Voting
            </h3>
            <p className="text-gray-600 dark:text-pink-200">
              One vote per user with automatic poll locking after deadline. User authentication ensures fair voting, and admins can track who voted for which option.
            </p>
          </Card>
        </div>

        {/* Additional Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">Why Choose VoteAnalytics?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-indigo-900/50 dark:border-indigo-700/30 dark:backdrop-blur-sm hover:dark:border-indigo-600/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-indigo-100 mb-2">Fast & Easy Setup</h3>
                  <p className="text-gray-600 dark:text-indigo-200">
                    Create a poll in minutes. No technical knowledge required. Simply register, create your poll, and share the link with participants.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-purple-900/50 dark:border-purple-700/30 dark:backdrop-blur-sm hover:dark:border-purple-600/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-100 mb-2">Transparent & Accountable</h3>
                  <p className="text-gray-600 dark:text-purple-200">
                    Admins can see detailed voting records - know exactly which user voted for which option. Full transparency for audit and verification purposes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-pink-900/50 dark:border-pink-700/30 dark:backdrop-blur-sm hover:dark:border-pink-600/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600 dark:text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-100 mb-2">Time-Limited Polls</h3>
                  <p className="text-gray-600 dark:text-pink-200">
                    Set custom deadlines for your polls. Polls automatically lock after the deadline, ensuring timely decision-making and preventing late votes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-slate-800/80 dark:to-indigo-900/50 dark:border-indigo-700/30 dark:backdrop-blur-sm hover:dark:border-indigo-600/50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-indigo-100 mb-2">Beautiful Visualizations</h3>
                  <p className="text-gray-600 dark:text-indigo-200">
                    Interactive charts and graphs make it easy to understand voting patterns. Switch between bar charts and pie charts to view results from different perspectives.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mt-16">
          <Card className="bg-white/95 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 dark:border-slate-700/50 dark:backdrop-blur">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-indigo-100 text-center mb-6">Perfect For</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 dark:text-indigo-200 mb-1">Surveys</h4>
                <p className="text-sm text-gray-600 dark:text-indigo-300">Gather opinions and feedback</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-900 dark:text-purple-200 mb-1">Team Decisions</h4>
                <p className="text-sm text-gray-600 dark:text-purple-300">Make collaborative choices</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h4 className="font-semibold text-gray-900 dark:text-pink-200 mb-1">Education</h4>
                <p className="text-sm text-gray-600 dark:text-pink-300">Classroom polls and quizzes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <h4 className="font-semibold text-gray-900 dark:text-indigo-200 mb-1">Business</h4>
                <p className="text-sm text-gray-600 dark:text-indigo-300">Employee engagement & feedback</p>
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-indigo-800/20 dark:border-indigo-700/50">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-indigo-100 mb-2">Register & Login</h3>
              <p className="text-gray-600 dark:text-indigo-200">
                Create your account as a user to vote on polls, or login as an admin to create and manage polls.
              </p>
            </Card>
            <Card className="text-center dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-purple-800/20 dark:border-purple-700/50">
              <div className="text-4xl font-bold text-indigo-600 dark:text-purple-300 mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-100 mb-2">Create or Vote</h3>
              <p className="text-gray-600 dark:text-purple-200">
                Admins can create polls with custom questions and options. Users can browse and vote on active polls.
              </p>
            </Card>
            <Card className="text-center dark:bg-gradient-to-br dark:from-pink-900/40 dark:to-pink-800/20 dark:border-pink-700/50">
              <div className="text-4xl font-bold text-indigo-600 dark:text-pink-300 mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-pink-100 mb-2">View Results</h3>
              <p className="text-gray-600 dark:text-pink-200">
                See real-time results with interactive charts. Admins can track detailed voting information.
              </p>
            </Card>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="mt-16 text-center">
          <Card className="bg-white/90 dark:bg-gradient-to-r dark:from-indigo-900/90 dark:via-purple-900/90 dark:to-pink-900/90 dark:border-purple-700/50 dark:backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-indigo-200 mb-2 max-w-2xl mx-auto">
              Use the navigation bar above to login or register. As a user, you can vote on active polls and see results. 
              As an admin, you can create polls, manage them, and view detailed voting analytics.
            </p>
            <p className="text-gray-500 dark:text-purple-300 text-sm mt-4">
              VoteAnalytics makes democratic decision-making simple, secure, and transparent.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;


