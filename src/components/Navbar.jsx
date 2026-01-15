import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Navbar = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const currentUser = authAPI.getCurrentUser();
  const currentAdmin = authAPI.getCurrentAdmin();
  const isUserLoggedIn = authAPI.isUser();
  const isAdminLoggedIn = authAPI.isAdmin();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to={isAdmin ? '/admin/dashboard' : (isUserLoggedIn ? '/polls' : '/')} 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              aria-label="VoteAnalytics home"
            >
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">VoteAnalytics</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {isAdmin ? (
              <>
                {isAdminLoggedIn && currentAdmin ? (
                  <>
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden sm:inline" aria-label="Current user">
                      Welcome, <span className="font-semibold">{currentAdmin.name || currentAdmin.username}</span>
                    </span>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 active:bg-red-700 dark:active:bg-red-800"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 active:bg-red-700 dark:active:bg-red-800"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {isUserLoggedIn && currentUser ? (
                  <>
                    <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden sm:inline" aria-label="Current user">
                      Welcome, <span className="font-semibold">{currentUser.name || currentUser.username}</span>
                    </span>
                    <Link
                      to="/profile"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="View profile"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 active:bg-red-700"
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login?type=user"
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 active:bg-indigo-800 dark:active:bg-indigo-700"
                    >
                      Register
                    </Link>
                    <div className="hidden sm:flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-600">
                      <Link
                        to="/admin/register"
                        className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 active:bg-purple-800 dark:active:bg-purple-700"
                      >
                        Admin Signup
                      </Link>
                      <Link
                        to="/login?type=admin"
                        className="bg-indigo-700 dark:bg-indigo-600 hover:bg-indigo-800 dark:hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 active:bg-indigo-900 dark:active:bg-indigo-800"
                      >
                        Admin Login
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


