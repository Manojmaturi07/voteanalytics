# UX Improvements - Quick Reference Guide

## For Developers

### Using the LoadingSkeleton Component

#### Basic Usage:
```jsx
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

// Poll cards grid
<LoadingSkeleton variant="card" count={6} />

// List of items
<LoadingSkeleton variant="poll-list" count={5} />

// Single lines
<LoadingSkeleton variant="line" count={3} />

// Avatar circle
<LoadingSkeleton variant="circle" />
```

#### Props:
- `variant`: 'card' | 'poll-list' | 'line' | 'circle' (default: 'card')
- `count`: Number of items to display (default: 1)
- `ariaLabel`: Accessibility label (default: 'Loading content')

### Using the Enhanced Toast System

#### Already configured in `src/utils/toastConfig.js`

```jsx
import { showToast } from '../utils/toastConfig.js';

// Success notification (3s)
showToast.success('Poll created successfully! 🎉');

// Error notification (4s)
showToast.error('Failed to create poll');

// Warning notification (3.5s)
showToast.warning('Please login to vote');

// Info notification (3s)
showToast.info('Poll updated');

// Loading notification
const toastId = showToast.loading('Saving poll...');

// Update loading toast to success
showToast.update(toastId, {
  type: 'success',
  render: 'Poll saved!',
  isLoading: false,
  autoClose: 3000,
});
```

### Copy Link to Clipboard

```jsx
const copyPollLink = (pollId) => {
  const pollUrl = `${window.location.origin}/poll/${pollId}`;
  navigator.clipboard.writeText(pollUrl).then(() => {
    showToast.success('Poll link copied to clipboard!');
  }).catch(() => {
    showToast.error('Failed to copy link');
  });
};
```

### Date Filter Implementation

Already implemented in `UserPolls.jsx`, but here's the logic pattern:

```jsx
const [selectedDateFilter, setSelectedDateFilter] = useState('');

// In filter logic:
if (selectedDateFilter) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, todayStart.getDate());

  filtered = filtered.filter(poll => {
    const pollDate = new Date(poll.createdAt);
    const pollDateStart = new Date(pollDate.getFullYear(), pollDate.getMonth(), pollDate.getDate());

    switch (selectedDateFilter) {
      case 'today':
        return pollDateStart.getTime() === todayStart.getTime();
      case 'week':
        return pollDate >= weekAgo;
      case 'month':
        return pollDate >= monthAgo;
      default:
        return true;
    }
  });
}
```

### Pagination (Already Implemented)

```jsx
// In component state
const [currentPage, setCurrentPage] = useState(1);
const [pollsPerPage] = useState(9); // 3x3 grid

// Calculate pagination
const indexOfLastPoll = currentPage * pollsPerPage;
const indexOfFirstPoll = indexOfLastPoll - pollsPerPage;
const currentPolls = filteredPolls.slice(indexOfFirstPoll, indexOfLastPoll);
const totalPages = Math.ceil(filteredPolls.length / pollsPerPage);

// Reset page when filters change
setCurrentPage(1);
```

---

## Updated Pages

### UserPolls.jsx ✅
- ✅ LoadingSkeleton implemented
- ✅ Date filtering added
- ✅ Copy link button added
- ✅ Toast notifications integrated
- ✅ Pagination working with filters

### PollVoting.jsx ✅
- ✅ LoadingSkeleton replaced spinner
- ✅ Already has vote success toast

### PollResults.jsx ✅
- ✅ LoadingSkeleton replaced spinner
- ✅ Already has export success toasts
- ✅ Bookmark toggle toasts

### EditPoll.jsx ✅
- ✅ LoadingSkeleton replaced spinner
- ✅ Already has update success toast

### AdminDashboard.jsx ✅
- ✅ LoadingSkeleton replaced spinner
- ✅ Copy link button added
- ✅ Already has delete/publish success toasts

---

## Adding to New Pages

### 1. Replace Spinners with Skeletons
```jsx
// Before
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// After
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

// In render
{loading && <LoadingSkeleton variant="card" count={6} />}
```

### 2. Add Toast Notifications
```jsx
import { showToast } from '../utils/toastConfig.js';

// On success
showToast.success('Action completed!');

// On error
showToast.error('Action failed');
```

### 3. Add Copy Functionality
```jsx
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => showToast.success('Copied!'))
    .catch(() => showToast.error('Failed to copy'));
};
```

---

## File Locations

| Feature | File |
|---------|------|
| Skeleton Loader | `src/components/LoadingSkeleton.jsx` |
| Toast System | `src/utils/toastConfig.js` |
| User Polls | `src/pages/UserPolls.jsx` |
| Poll Voting | `src/pages/PollVoting.jsx` |
| Poll Results | `src/pages/PollResults.jsx` |
| Create Poll | `src/pages/CreatePoll.jsx` |
| Edit Poll | `src/pages/EditPoll.jsx` |
| Admin Dashboard | `src/pages/AdminDashboard.jsx` |

---

## Styling & Theming

### Dark Mode
All components automatically support dark mode via Tailwind's `dark:` prefix:
- Skeleton backgrounds: `bg-gray-300 dark:bg-gray-600`
- Text colors: `text-gray-900 dark:text-white`
- Buttons: `bg-indigo-600 dark:bg-indigo-700`

### Animations
- Skeleton shimmer: `animate-pulse` (built-in Tailwind)
- Button hover: `hover:bg-gray-200 dark:hover:bg-gray-600`
- Transition: `transition-all` / `transition-colors`

---

## Performance Tips

1. **Skeleton Loading**: Use appropriate variant for content type
2. **Pagination**: Keeps DOM size manageable (9 items per page)
3. **Filtering**: Done client-side, no API overhead
4. **Toast Cleanup**: Auto-closes after set duration
5. **Dark Mode**: Uses CSS custom properties for efficiency

---

## Accessibility Checklist

- ✅ ARIA labels on skeletons
- ✅ Keyboard navigation on buttons
- ✅ Focus visible states
- ✅ Color contrast maintained
- ✅ Screen reader friendly
- ✅ Semantic HTML

---

## Common Issues & Solutions

### Toast Not Showing
- Ensure `react-toastify` is installed: `npm install react-toastify`
- Check browser console for errors
- Toast container should be in root App

### Skeleton Not Animating
- Verify `animate-pulse` is available in Tailwind config
- Check browser DevTools for CSS loading
- Clear browser cache

### Copy Button Not Working
- Verify browser supports Clipboard API
- Check for HTTPS (required for clipboard access)
- Use try/catch for error handling

### Date Filter Not Working
- Verify date format in poll data
- Check timezone handling
- Ensure `createdAt` field exists on polls

---

## Testing

### Manual Testing Checklist
- [ ] Skeleton appears while loading
- [ ] Date filters work correctly
- [ ] Copy button copies correct URL
- [ ] Toast notifications appear
- [ ] Dark mode displays correctly
- [ ] Pagination works with filters
- [ ] Mobile responsive
- [ ] Keyboard navigation works

---

**Last Updated:** January 17, 2026
