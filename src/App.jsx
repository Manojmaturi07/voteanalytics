import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SessionTimeoutManager from './components/SessionTimeoutManager.jsx';
import { authAPI } from './services/api.js';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const UserRegistration = lazy(() => import('./pages/UserRegistration.jsx'));
const AdminRegistration = lazy(() => import('./pages/AdminRegistration.jsx'));
const UserPolls = lazy(() => import('./pages/UserPolls.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminVotingOverview = lazy(() => import('./pages/AdminVotingOverview.jsx'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement.jsx'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics.jsx'));
const CreatePoll = lazy(() => import('./pages/CreatePoll.jsx'));
const EditPoll = lazy(() => import('./pages/EditPoll.jsx'));
const PollVoting = lazy(() => import('./pages/PollVoting.jsx'));
const PollResults = lazy(() => import('./pages/PollResults.jsx'));
const PollVotingDetails = lazy(() => import('./pages/PollVotingDetails.jsx'));
const ConfettiDemo = lazy(() => import('./pages/ConfettiDemo.jsx'));
const EmailVerification = lazy(() => import('./pages/EmailVerification.jsx'));
const TwoFactorSetup = lazy(() => import('./pages/TwoFactorSetup.jsx'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings.jsx'));

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  if (!authAPI.isAdmin()) {
    return <Navigate to="/login?type=admin" replace />;
  }
  return children;
};

// Protected Route Component for User
const UserProtectedRoute = ({ children }) => {
  if (!authAPI.isUser()) {
    return <Navigate to="/login?type=user" replace />;
  }
  return children;
};

// ToastContainer wrapper that uses theme from context
const ThemedToastContainer = () => {
  const { theme } = useTheme();
  return (
    <ToastContainer 
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
      limit={3}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-to-main" tabIndex="0">
          Skip to main content
        </a>
        <ThemedToastContainer />
        <SessionTimeoutManager>
          <main id="main-content" tabIndex={-1}>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size="lg" text="Loading..." />
              </div>
            }>
              <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/admin/register" element={<AdminRegistration />} />
        <Route
          path="/polls"
          element={
            <UserProtectedRoute>
              <UserPolls />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <UserProtectedRoute>
              <UserProfile />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/create-poll"
          element={
            <AdminProtectedRoute>
              <CreatePoll />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/poll/:pollId/edit"
          element={
            <AdminProtectedRoute>
              <EditPoll />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/voting-overview"
          element={
            <AdminProtectedRoute>
              <AdminVotingOverview />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUserManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
              <AdminAnalytics />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/poll/:pollId/votes"
          element={
            <AdminProtectedRoute>
              <PollVotingDetails />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/poll/:pollId"
          element={<PollVoting />}
        />
        <Route path="/results/:pollId" element={<PollResults />} />
        <Route path="/confetti-demo" element={<ConfettiDemo />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        <Route
          path="/settings/security"
          element={
            <UserProtectedRoute>
              <SecuritySettings />
            </UserProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </SessionTimeoutManager>
      </Router>
    </ThemeProvider>
  );
}

export default App;

