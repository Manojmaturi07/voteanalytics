import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import UserRegistration from './pages/UserRegistration.jsx';
import AdminRegistration from './pages/AdminRegistration.jsx';
import UserPolls from './pages/UserPolls.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminVotingOverview from './pages/AdminVotingOverview.jsx';
import AdminUserManagement from './pages/AdminUserManagement.jsx';
import AdminAnalytics from './pages/AdminAnalytics.jsx';
import CreatePoll from './pages/CreatePoll.jsx';
import EditPoll from './pages/EditPoll.jsx';
import PollVoting from './pages/PollVoting.jsx';
import PollResults from './pages/PollResults.jsx';
import PollVotingDetails from './pages/PollVotingDetails.jsx';
import ConfettiDemo from './pages/ConfettiDemo.jsx';
import { authAPI } from './services/api.js';

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
        <main id="main-content" tabIndex={-1}>
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
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;

