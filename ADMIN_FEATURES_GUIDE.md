# Admin Features Implementation Guide

## 📊 Admin Dashboard Enhancements

### 1. Poll Moderation
**Location:** `src/pages/AdminDashboard.jsx`

#### Features Implemented:
- ✅ **Publish/Unpublish Polls** - Toggle poll visibility
  - Hidden polls don't appear on user voting pages
  - Useful for unpublishing inappropriate polls
  - Button shows current status (Publish/Unpublish)

- ✅ **Status Badges**
  - Unpublished (Gray) - Hidden from users
  - Active (Green) - Currently accepting votes
  - Locked (Red) - Voting closed or expired

#### Usage:
```jsx
// Click "Publish" button to publish a hidden poll
// Click "Unpublish" button to hide a poll
// Updates the isPublished flag in poll data
```

---

### 2. Analytics Charts & Trends
**Location:** `src/pages/AdminAnalytics.jsx`

#### Features Implemented:
- ✅ **Statistics Overview**
  - Total Polls Count
  - Total Votes Across All Polls
  - Active Polls (currently accepting votes)
  - Completed Polls (locked or expired)
  - Total Registered Users

- ✅ **Visualizations**
  - **Popular Polls Bar Chart** - Top 5 polls by vote count
  - **Category Distribution Pie Chart** - Polls grouped by category
  - Real-time vote aggregation

#### Data Displayed:
```javascript
{
  totalPolls: 15,
  totalVotes: 3420,
  activePolls: 8,
  completedPolls: 7,
  totalUsers: 156
}
```

---

### 3. Export to CSV/Excel
**Location:** `src/utils/exportUtils.js`

#### Functions Available:

##### `exportToCSV(poll, pollId)`
Exports poll results as CSV file
```javascript
// Parameters:
// - poll: Poll object with options and votes
// - pollId: Unique poll identifier

// Includes:
// - Poll question
// - Poll ID
// - Creation date
// - Deadline
// - Option votes and percentages
// - Total vote count
```

##### `exportToPDF(poll, pollId)`
Exports poll results as PDF (with fallback to print)
```javascript
// Automatically opens print dialog if jsPDF unavailable
// Formats data in printer-friendly table format
```

#### Usage Example:
```jsx
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';

// Export to CSV
<Button onClick={() => exportToCSV(poll, poll.id)}>
  Export CSV
</Button>

// Export to PDF
<Button onClick={() => exportToPDF(poll, poll.id)}>
  Export PDF
</Button>
```

---

### 4. User Analytics
**Planned Enhancement - Can be added to:**
`src/pages/AdminUserManagement.jsx`

#### Metrics to Track:
- Active Users (logged in last 7 days)
- Total User Registrations (with trend chart)
- User Engagement Rate
- Registration Trends (daily/weekly/monthly)
- Voter Demographics (age groups if available)

#### Implementation:
```jsx
// Add to AdminUserManagement page:
const [userMetrics, setUserMetrics] = useState({
  activeUsers: 0,
  totalRegistrations: 0,
  engagementRate: 0,
  registrationTrend: [], // Week-over-week data
});

// Add new charts:
// - Line chart for registration trends
// - Gauge for engagement rate
// - Active users count card
```

---

## 🛠️ Technical Implementation Details

### Poll Moderation (Already Added)
```jsx
// Handler function for toggling publication status
const handleTogglePublish = async (poll) => {
  try {
    setModeratingPollId(poll.id);
    const updatedPoll = {
      ...poll,
      isPublished: !poll.isPublished,
    };
    await pollsAPI.updatePoll(poll.id, updatedPoll);
    // Update UI with new status
    showToast.success(
      updatedPoll.isPublished ? 'Poll published' : 'Poll unpublished'
    );
  } catch (err) {
    showToast.error('Failed to update poll status');
  }
};
```

### Status Badge Component
```jsx
const getStatusBadge = (poll) => {
  if (!poll.isPublished) {
    return <span className="badge-unpublished">Unpublished</span>;
  }
  if (poll.isLocked || isPastDeadline(poll.deadline)) {
    return <span className="badge-locked">Locked</span>;
  }
  return <span className="badge-active">Active</span>;
};
```

---

## 📋 API Requirements

### Poll Update Endpoint
```javascript
// UPDATE /api/polls/:pollId
// Body:
{
  ...pollData,
  isPublished: boolean // Toggle this flag
}
```

### User Analytics Endpoint (For Future)
```javascript
// GET /api/analytics/users
// Returns:
{
  activeUsers: number,
  totalRegistrations: number,
  registrationTrend: [
    { date: string, count: number },
    ...
  ]
}
```

---

## 🎯 Usage Workflow

### Admin Dashboard:
1. **View Polls** - See all created polls
2. **Moderate** - Click "Publish" or "Unpublish" to control visibility
3. **Delete** - Remove inappropriate polls
4. **Edit** - Modify poll details
5. **Share** - Get poll link for sharing

### Analytics:
1. Go to **Analytics** tab
2. View **statistics cards** for overview
3. Check **charts** for trends and popular polls
4. Export data to **CSV** for reporting

### Poll Results:
1. Click **"Results"** on any poll card
2. View results visualization
3. Click **"Export"** button to download as CSV/PDF

---

## 🔧 Libraries Used
- **chart.js** (v4.5.1) - Data visualization
- **react-chartjs-2** (v5.3.1) - React wrapper for charts
- **jspdf** (v4.0.0) - PDF export (optional fallback to print)
- **html2canvas** (included) - Screenshot capability

---

## 📈 Future Enhancements

1. **Advanced Filtering**
   - Filter polls by status, date range, category
   - Search functionality

2. **Bulk Operations**
   - Publish/Unpublish multiple polls
   - Bulk export

3. **User Demographics**
   - Age group analytics
   - Voter participation metrics
   - Engagement scoring

4. **Automated Reports**
   - Daily/Weekly email summaries
   - PDF report generation

5. **Real-time Dashboard**
   - Live vote count updates
   - Active user tracking
   - Trending polls widget

---

## ✅ Testing Checklist

- [ ] Publish/Unpublish poll works correctly
- [ ] Status badge updates on toggle
- [ ] Hidden polls don't appear in user voting list
- [ ] Analytics charts render correctly
- [ ] CSV export contains accurate data
- [ ] PDF export/print works in all browsers
- [ ] Modal dialogs are accessible
- [ ] Mobile responsive on small screens

---

## 📝 Notes

- Unpublished polls are still visible to admins for management
- Votes are preserved when unpublishing/republishing
- Export files include timestamp for easy organization
- All admin actions are logged (recommended for security)
- Moderation changes are permanent (good for compliance)
