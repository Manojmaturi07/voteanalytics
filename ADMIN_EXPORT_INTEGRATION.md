// Quick Integration Guide for Export Buttons

// FILE: src/pages/PollResults.jsx
// Add export functionality to poll results page

// STEP 1: Add import at the top
import { exportToCSV, exportToPDF } from '../utils/exportUtils.js';
import Button from '../components/Button.jsx';

// STEP 2: In your component, add buttons to the results section
// Place in your render method where results are displayed:

export const PollResultsExportSection = ({ poll, pollId }) => {
  const handleExportCSV = () => {
    try {
      exportToCSV(poll, pollId);
    } catch (err) {
      showToast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(poll, pollId);
    } catch (err) {
      showToast.error('Failed to export PDF');
    }
  };

  return (
    <div className="mb-6 flex gap-3">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportCSV}
        ariaLabel="Export poll results as CSV file"
      >
        📥 Export CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportPDF}
        ariaLabel="Export poll results as PDF"
      >
        📄 Export PDF
      </Button>
    </div>
  );
};

// STEP 3: In AdminDashboard, add to poll card:
// In the poll results section:

<div className="flex space-x-2">
  <Button 
    size="sm" 
    onClick={() => exportToCSV(poll, poll.id)}
    className="flex-1"
  >
    Export Results
  </Button>
</div>

// ============================================
// ADVANCED: Bulk Export Multiple Polls to CSV
// ============================================

export const exportMultiplePolls = (polls) => {
  try {
    if (!polls || polls.length === 0) {
      throw new Error('No polls to export');
    }

    // Create CSV headers
    const headers = ['Poll Question', 'Total Votes', 'Active', 'Options Count', 'Created Date'];
    
    // Create rows from poll data
    const rows = polls.map(poll => {
      const totalVotes = (poll.options || []).reduce((sum, opt) => sum + (opt.votes || 0), 0);
      const isActive = !poll.isLocked && new Date(poll.deadline) > new Date();
      return [
        poll.question,
        totalVotes,
        isActive ? 'Yes' : 'No',
        poll.options?.length || 0,
        new Date(poll.createdAt).toLocaleDateString()
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `polls_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export polls:', err);
    throw new Error('Failed to export polls. Please try again.');
  }
};

// ============================================
// Usage in AdminAnalytics:
// ============================================

<Button 
  variant="primary" 
  onClick={() => exportMultiplePolls(polls)}
>
  📊 Export All Polls
</Button>

// ============================================
// USAGE EXAMPLES IN DIFFERENT CONTEXTS
// ============================================

// 1. In AdminDashboard.jsx - Per Poll Export:
const AdminDashboardExample = () => {
  return (
    <Card>
      <div className="flex gap-2">
        <Button onClick={() => exportToCSV(poll, poll.id)} size="sm">
          CSV
        </Button>
        <Button onClick={() => exportToPDF(poll, poll.id)} size="sm">
          PDF
        </Button>
      </div>
    </Card>
  );
};

// 2. In AdminAnalytics.jsx - Bulk Export:
const AdminAnalyticsExample = ({ polls }) => {
  return (
    <div className="mb-4">
      <h2>Export Options</h2>
      <Button 
        variant="primary"
        onClick={() => {
          try {
            exportMultiplePolls(polls);
            showToast.success('Polls exported successfully');
          } catch (err) {
            showToast.error(err.message);
          }
        }}
      >
        Export All Polls to CSV
      </Button>
    </div>
  );
};

// 3. In PollResults.jsx - Results Export:
const PollResultsExample = ({ poll, pollId }) => {
  return (
    <div className="results-section">
      <div className="flex gap-2 mb-6">
        <Button 
          onClick={() => {
            exportToCSV(poll, pollId);
            showToast.success('Results exported as CSV');
          }}
        >
          📊 Export Results (CSV)
        </Button>
        <Button 
          onClick={() => {
            exportToPDF(poll, pollId);
            showToast.success('Opening print preview...');
          }}
        >
          🖨️ Print Results (PDF)
        </Button>
      </div>
      {/* Results content */}
    </div>
  );
};

// ============================================
// CUSTOMIZING EXPORT FUNCTION
// ============================================

// To add custom data to exports, modify exportUtils.js:

export const exportToCSV = (poll, pollId, customData = {}) => {
  try {
    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    // Add custom data section if provided
    const customHeaders = customData?.title ? [`Report: ${customData.title}`] : [];
    const customRows = customData?.metadata 
      ? Object.entries(customData.metadata).map(([key, val]) => [`${key}:,${val}`])
      : [];

    const headers = ['Option', 'Votes', 'Percentage'];
    const rows = poll.options.map(opt => {
      const percentage = totalVotes > 0 
        ? ((opt.votes || 0) / totalVotes * 100).toFixed(2) 
        : '0.00';
      return [opt.text, opt.votes || 0, `${percentage}%`];
    });

    rows.push(['Total', totalVotes, '100%']);

    // Combine all content
    const csvContent = [
      ...customHeaders,
      `Poll: ${poll.question || 'Untitled Poll'}`,
      `Poll ID: ${pollId}`,
      `Created: ${poll.createdAt ? new Date(poll.createdAt).toLocaleString() : 'N/A'}`,
      `Deadline: ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'N/A'}`,
      `Exported: ${new Date().toLocaleString()}`,
      '',
      ...customRows,
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `poll_${pollId}_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export CSV:', err);
    throw new Error('Failed to export CSV. Please try again.');
  }
};

// ============================================
// QUICK CHECKLIST FOR ADDING EXPORTS
// ============================================

/*
□ Import exportToCSV and exportToPDF functions
□ Create handler functions for each button
□ Add try-catch blocks with error handling
□ Add UI buttons (can use Button component)
□ Add loading states if needed
□ Test CSV file downloads
□ Test PDF/print dialog opens
□ Verify data accuracy in exported files
□ Add toast messages for user feedback
□ Test on mobile devices
*/
