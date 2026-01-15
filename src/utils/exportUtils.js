/**
 * Export Utilities
 * Functions to export poll results as CSV and PDF
 * 
 * Defensive: Safely handles cases where libraries might not be available
 */

/**
 * Export poll results as CSV
 * @param {Object} poll - Poll object with options and votes
 * @param {string} pollId - Poll ID
 */
export const exportToCSV = (poll, pollId) => {
  try {
    if (!poll || !poll.options) {
      throw new Error('Invalid poll data');
    }

    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    // Create CSV content
    const headers = ['Option', 'Votes', 'Percentage'];
    const rows = poll.options.map(opt => {
      const percentage = totalVotes > 0 ? ((opt.votes || 0) / totalVotes * 100).toFixed(2) : '0.00';
      return [opt.text, opt.votes || 0, `${percentage}%`];
    });

    // Add summary row
    rows.push(['Total', totalVotes, '100%']);

    // Combine headers and rows
    const csvContent = [
      `Poll: ${poll.question || 'Untitled Poll'}`,
      `Poll ID: ${pollId}`,
      `Created: ${poll.createdAt ? new Date(poll.createdAt).toLocaleString() : 'N/A'}`,
      `Deadline: ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'N/A'}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
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

/**
 * Export poll results as PDF
 * Note: This is a simplified version. For production, use a library like jsPDF or pdfkit
 * To install: npm install jspdf
 * 
 * @param {Object} poll - Poll object with options and votes
 * @param {string} pollId - Poll ID
 */
export const exportToPDF = async (poll, pollId) => {
  try {
    // Check if jsPDF is available
    let jsPDF;
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default || jsPDFModule;
    } catch (err) {
      // Fallback: Open print dialog with formatted content
      console.warn('jsPDF not available. Opening print dialog instead.');
      const printWindow = window.open('', '_blank');
      const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Poll Results - ${poll.question || 'Untitled Poll'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${poll.question || 'Untitled Poll'}</h1>
          <p><strong>Poll ID:</strong> ${pollId}</p>
          <p><strong>Created:</strong> ${poll.createdAt ? new Date(poll.createdAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Deadline:</strong> ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'N/A'}</p>
          <table>
            <thead>
              <tr>
                <th>Option</th>
                <th>Votes</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${poll.options.map(opt => {
                const percentage = totalVotes > 0 ? ((opt.votes || 0) / totalVotes * 100).toFixed(2) : '0.00';
                return `<tr><td>${opt.text}</td><td>${opt.votes || 0}</td><td>${percentage}%</td></tr>`;
              }).join('')}
              <tr><td><strong>Total</strong></td><td><strong>${totalVotes}</strong></td><td><strong>100%</strong></td></tr>
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    // Use jsPDF if available
    if (!jsPDF) {
      throw new Error('PDF library not available');
    }

    const doc = new jsPDF();
    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    // Add title
    doc.setFontSize(16);
    doc.text(poll.question || 'Untitled Poll', 14, 20);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Poll ID: ${pollId}`, 14, 30);
    doc.text(`Created: ${poll.createdAt ? new Date(poll.createdAt).toLocaleString() : 'N/A'}`, 14, 36);
    doc.text(`Deadline: ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'N/A'}`, 14, 42);

    // Add table
    let y = 50;
    doc.setFontSize(12);
    doc.text('Option', 14, y);
    doc.text('Votes', 100, y);
    doc.text('Percentage', 140, y);
    y += 6;

    doc.setFontSize(10);
    poll.options.forEach(opt => {
      const percentage = totalVotes > 0 ? ((opt.votes || 0) / totalVotes * 100).toFixed(2) : '0.00';
      doc.text(opt.text.substring(0, 30), 14, y);
      doc.text(String(opt.votes || 0), 100, y);
      doc.text(`${percentage}%`, 140, y);
      y += 6;
    });

    // Add total
    doc.setFontSize(12);
    doc.text('Total', 14, y);
    doc.text(String(totalVotes), 100, y);
    doc.text('100%', 140, y);

    // Save PDF
    doc.save(`poll_${pollId}_results_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('Failed to export PDF:', err);
    throw new Error('Failed to export PDF. Please try again.');
  }
};

