/**
 * Email Notification Service
 * Mock/placeholder service for sending email notifications
 * 
 * In a real application, this would integrate with an email service provider
 * like SendGrid, AWS SES, Mailgun, etc.
 * 
 * To implement real email:
 * 1. Install email service SDK (e.g., @sendgrid/mail, aws-sdk)
 * 2. Configure API keys in environment variables
 * 3. Replace mock functions with actual API calls
 */

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - Email HTML body
 * @param {string} textBody - Email plain text body (optional)
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
export const sendEmail = async (to, subject, htmlBody, textBody = null) => {
  try {
    // Mock delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In production, this would make an actual API call:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //   to,
    //   from: process.env.FROM_EMAIL,
    //   subject,
    //   text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
    //   html: htmlBody,
    // };
    // await sgMail.send(msg);

    // Mock response
    console.log(`[Email Service] Mock email sent to ${to}`);
    console.log(`Subject: ${subject}`);
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  } catch (err) {
    console.error('[Email Service] Failed to send email:', err);
    throw new Error('Failed to send email notification');
  }
};

/**
 * Notify users when a new poll is created
 * @param {Object} poll - Poll object
 * @param {Array<string>} userEmails - Array of user email addresses
 */
export const notifyNewPoll = async (poll, userEmails = []) => {
  if (!poll || !userEmails || userEmails.length === 0) {
    return { success: false, message: 'Invalid poll or user emails' };
  }

  const subject = `New Poll Available: ${poll.question || 'Untitled Poll'}`;
  const pollUrl = `${window.location.origin}/poll/${poll.id}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">New Poll Available!</h2>
      <p>A new poll has been created and is now available for voting:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${poll.question || 'Untitled Poll'}</h3>
        <p><strong>Deadline:</strong> ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'Not set'}</p>
        ${poll.category ? `<p><strong>Category:</strong> ${poll.category}</p>` : ''}
      </div>
      <a href="${pollUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Vote Now
      </a>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated notification from VoteAnalytics.
      </p>
    </div>
  `;

  const textBody = `
New Poll Available!

A new poll has been created: ${poll.question || 'Untitled Poll'}

Deadline: ${poll.deadline ? new Date(poll.deadline).toLocaleString() : 'Not set'}
${poll.category ? `Category: ${poll.category}` : ''}

Vote here: ${pollUrl}

This is an automated notification from VoteAnalytics.
  `;

  // Send to all users (in production, batch send or use email service features)
  const results = [];
  for (const email of userEmails) {
    try {
      const result = await sendEmail(email, subject, htmlBody, textBody);
      results.push({ email, success: true, ...result });
    } catch (err) {
      results.push({ email, success: false, error: err.message });
    }
  }

  return {
    success: results.some(r => r.success),
    results,
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
  };
};

/**
 * Get all user emails (mock - in production, fetch from database)
 * @returns {Promise<Array<string>>}
 */
export const getAllUserEmails = async () => {
  // Mock: In production, fetch from database/API
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [
    'john@example.com',
    'jane@example.com',
  ];
};

