import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { showToast } from '../utils/toastConfig.js';
import { validateLoginForm } from '../utils/validation.js';
import { handleApiError } from '../utils/errorHandler.js';

/**
 * Login Component
 * 
 * Handles user and admin authentication with form validation and error handling.
 * 
 * @component
 */
const Login = () => {
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get('type') || 'user'; // 'user' or 'admin'
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(loginType === 'admin');
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdminLogin(loginType === 'admin');
  }, [loginType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    // Client-side validation
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      showToast.warning(firstError);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData.username, formData.password);
      if (response && response.success) {
        showToast.success(`Welcome back! 👋`);
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/polls');
        }
      }
    } catch (err) {
      const errorMsg = handleApiError(err, {
        defaultMessage: 'Invalid credentials. Please try again.',
        onError: (msg) => showToast.error(msg)
      });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2" tabIndex={-1}>VoteAnalytics</h1>
          <p className="text-gray-600 dark:text-gray-300">{isAdminLogin ? 'Admin Login' : 'User Login'}</p>
        </div>

        {/* Toggle between Admin and User login */}
        <div className="mb-6 flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="group" aria-label="Login type selection">
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(false);
              setError('');
              navigate('/login?type=user', { replace: true });
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              !isAdminLogin
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            aria-pressed={!isAdminLogin}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(true);
              setError('');
              navigate('/login?type=admin', { replace: true });
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isAdminLogin
                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
            aria-pressed={isAdminLogin}
          >
            Admin Login
          </button>
        </div>

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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.username 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter username"
              required
              aria-label="Username"
              aria-required="true"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              autoComplete="username"
            />
            {errors.username && (
              <p id="username-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.password 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Enter password"
              required
              aria-label="Password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full flex items-center justify-center"
            aria-busy={loading}
            aria-label={loading ? 'Logging in' : 'Login'}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        {isAdminLogin ? (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            <p>Demo Admin Credentials:</p>
            <p className="font-mono mt-1 text-xs sm:text-sm">Username: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">admin</span> | Password: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">admin123</span></p>
          </div>
        ) : (
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1">
                Register here
              </Link>
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              Demo User Credentials:
            </p>
            <p className="font-mono mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Username: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">john_doe</span> | Password: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">user123</span></p>
            <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300">Username: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">jane_smith</span> | Password: <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded">user123</span></p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;


