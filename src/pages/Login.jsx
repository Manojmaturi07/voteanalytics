import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { showToast } from '../utils/toastConfig.js';

const Login = () => {
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get('type') || 'user'; // 'user' or 'admin'
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(loginType === 'admin');
  const navigate = useNavigate();

  useEffect(() => {
    setIsAdminLogin(loginType === 'admin');
  }, [loginType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      const msg = 'Please fill in all fields';
      setError(msg);
      showToast.warning(msg);
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData.username, formData.password);
      if (response.success) {
        showToast.success(`Welcome back! 👋`);
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/polls');
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" tabIndex={-1}>VoteAnalytics</h1>
          <p className="text-gray-600">{isAdminLogin ? 'Admin Login' : 'User Login'}</p>
        </div>

        {/* Toggle between Admin and User login */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Login type selection">
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(false);
              setError('');
              navigate('/login?type=user', { replace: true });
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              !isAdminLogin
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={isAdminLogin}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start" role="alert">
              <svg className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter username"
              required
              aria-label="Username"
              aria-required="true"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter password"
              required
              aria-label="Password"
              aria-required="true"
              autoComplete="current-password"
            />
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
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo Admin Credentials:</p>
            <p className="font-mono mt-1 text-xs sm:text-sm">Username: <span className="bg-gray-100 px-1 rounded">admin</span> | Password: <span className="bg-gray-100 px-1 rounded">admin123</span></p>
          </div>
        ) : (
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1">
                Register here
              </Link>
            </p>
            <p className="text-gray-600 mt-3">
              Demo User Credentials:
            </p>
            <p className="font-mono mt-1 text-xs sm:text-sm text-gray-600">Username: <span className="bg-gray-100 px-1 rounded">john_doe</span> | Password: <span className="bg-gray-100 px-1 rounded">user123</span></p>
            <p className="font-mono text-xs sm:text-sm text-gray-600">Username: <span className="bg-gray-100 px-1 rounded">jane_smith</span> | Password: <span className="bg-gray-100 px-1 rounded">user123</span></p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;


