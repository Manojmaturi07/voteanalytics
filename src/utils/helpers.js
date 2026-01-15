// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if date is in the past
export const isPastDeadline = (deadline) => {
  return new Date(deadline) < new Date();
};

// Format time remaining
export const getTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

// Generate poll share link
export const getPollShareLink = (pollId) => {
  return `${window.location.origin}/poll/${pollId}`;
};


