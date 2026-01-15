# VoteAnalytics - Online Poll & Voting Application

A production-ready React application for creating, managing, and participating in online polls with real-time results visualization.

## 🚀 Features

### Admin Features
- **Secure Login**: Admin authentication with credential validation
- **Create Polls**: Create custom polls with multiple options and deadlines
- **Dashboard**: View all polls with live vote counts and status
- **Auto-lock**: Polls automatically lock after the deadline
- **Results Monitoring**: Real-time vote tracking and visualization

### User Features
- **Vote on Polls**: Access polls via shared links
- **One Vote Per User**: Prevents duplicate voting
- **Vote Confirmation**: Success feedback after voting
- **Results View**: View poll results with interactive charts
- **Share Polls**: Easy sharing functionality

### Technical Features
- **Real-time Updates**: Live vote count updates
- **Chart Visualization**: Bar and Pie charts using Chart.js
- **Responsive Design**: Modern UI with Tailwind CSS
- **Mock Backend**: Ready for Spring Boot integration
- **Clean Architecture**: Scalable folder structure

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd myself
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (Vite will automatically open it)

## 🔐 Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Modal.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── CreatePoll.jsx
│   ├── PollVoting.jsx
│   └── PollResults.jsx
├── services/           # API service layer
│   └── api.js
├── utils/              # Utility functions
│   └── helpers.js
├── App.js              # Main app component with routing
└── index.js            # Entry point
```

## 🎯 Routes

- `/` - Home page
- `/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)
- `/admin/create-poll` - Create new poll (protected)
- `/poll/:pollId` - User voting page
- `/results/:pollId` - Poll results page

## 🎨 Tech Stack

- **React** (JSX) - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client (configured for API calls)
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **React Chart.js 2** - React wrapper for Chart.js

## 🔌 API Integration

The application uses a mock API service located in `src/services/api.js`. The API layer is structured to easily integrate with a Spring Boot backend:

### Current Mock Implementation
- Authentication stored in memory
- Polls stored in memory
- Vote tracking in browser session

### For Spring Boot Integration
1. Update `API_BASE_URL` in `src/services/api.js`
2. Replace mock functions with actual axios calls
3. Implement proper authentication token handling
4. Update API endpoints to match your backend

### API Endpoints Structure (for reference)
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/polls
GET    /api/polls/:id
POST   /api/polls
POST   /api/polls/:id/vote
GET    /api/polls/:id/results
```

## 🎨 Styling

The application uses Tailwind CSS for styling. Configuration files:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/index.css` - Global styles with Tailwind directives

## 📊 Features in Detail

### Poll Creation
- Add 2-10 options per poll
- Set custom deadline (date and time)
- Automatic validation
- Real-time preview

### Voting System
- Single vote per user (tracked in session)
- Visual selection with radio buttons
- Confirmation modal after voting
- Immediate results display

### Results Visualization
- Bar chart view
- Pie chart view
- Real-time vote count updates
- Percentage calculations
- Leading option highlighting
- Detailed results list

### Admin Dashboard
- Overview of all polls
- Status indicators (Active/Locked)
- Total vote counts
- Time remaining display
- Quick actions (View Poll, View Results)

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

## 🧪 Testing

```bash
npm test
```

## 📝 Notes

- The current implementation uses mock data stored in memory
- Polls and votes are reset on page refresh
- Authentication is frontend-only (mock token)
- For production, integrate with a proper backend API

## 🔄 Future Enhancements

- User registration and authentication
- Persistent data storage
- Email notifications
- Poll analytics and insights
- Export results to CSV/PDF
- Multi-language support
- Advanced chart types
- Poll categories and tags

## 👨‍💻 Development

### Code Quality
- Functional components with hooks
- Proper state management
- Reusable components
- Clean code structure
- Meaningful variable names

### Best Practices
- Component separation
- API service abstraction
- Error handling
- Loading states
- Responsive design

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

This is a project template. Feel free to extend and customize as needed.

---

**Built with ❤️ using React and Vite**
