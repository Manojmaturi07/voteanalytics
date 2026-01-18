import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'No password' };
    if (password.length < 6) return { strength: 1, label: 'Too short' };
    
    let strength = 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return { 
      strength: Math.min(strength, 4), 
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)]
    };
  };

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Invalid email address';
        }
        break;
      case 'password':
        if (value.length < 6 && value.length > 0) {
          errors.password = 'Password must be at least 6 characters';
        }
        break;
      case 'age':
        const age = parseInt(value, 10);
        if (value && (isNaN(age) || age < 13)) {
          errors.age = 'Must be at least 13 years old';
        } else if (age > 120) {
          errors.age = 'Please enter a valid age';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      ...errors,
      [name]: errors[name] || ''
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.name.trim() || !formData.age) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 13) {
      setError('You must be at least 13 years old to register');
      setLoading(false);
      return;
    }

    if (age > 120) {
      setError('Please enter a valid age');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      );
      if (response.success) {
        // Auto-login after registration
        const loginResponse = await authAPI.login(formData.username, formData.password);
        if (loginResponse.success) {
          navigate('/polls');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">VoteAnalytics</h1>
          <p className="text-gray-600">Create User Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your full name"
              aria-describedby="name-help"
              aria-required="true"
              required
            />
            <p id="name-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your first and last name</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Choose a username"
              aria-describedby="username-help"
              aria-required="true"
              required
            />
            <p id="username-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">A unique identifier for your account</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white outline-none transition ${ 
                fieldErrors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
              } focus:ring-2 focus:border-transparent`}
              placeholder="Enter your email"
              aria-describedby={fieldErrors.email ? "email-error" : ""}
              aria-required="true"
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md outline-none transition ${ 
                fieldErrors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
              } dark:bg-gray-700 dark:text-white focus:ring-2 focus:border-transparent`}
              placeholder="Enter password (min. 6 characters)"
              aria-describedby="password-strength"
              aria-required="true"
              required
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${getPasswordStrength(formData.password).color}`}
                      style={{width: `${(getPasswordStrength(formData.password).strength / 4) * 100}%`}}
                      aria-hidden="true"
                    />
                  </div>
                  <span id="password-strength" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {getPasswordStrength(formData.password).label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use uppercase, lowercase, numbers, and symbols for stronger passwords
                </p>
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white outline-none transition ${ 
                fieldErrors.age 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
              } focus:ring-2 focus:border-transparent`}
              placeholder="Enter your age"
              min="13"
              max="120"
              aria-describedby={fieldErrors.age ? "age-error" : "age-help"}
              aria-required="true"
              required
            />
            {fieldErrors.age && (
              <p id="age-error" className="text-xs text-red-500 mt-1">{fieldErrors.age}</p>
            )}
            {!fieldErrors.age && (
              <p id="age-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">You must be at least 13 years old to register</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Login here
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Are you an admin?{' '}
            <Link to="/login?type=admin" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Admin Login
            </Link>{' '}
            or{' '}
            <Link to="/admin/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Register as Admin
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserRegistration;

