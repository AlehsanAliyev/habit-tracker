function calculateStreak(logs) {
    // Sort logs by date (newest first)
    const sorted = logs
      .filter(log => log.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  
    let streak = 0;
    let currentDate = new Date();
  
    for (let log of sorted) {
      const logDate = new Date(log.date);
      const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
  
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else {
        break;
      }
    }
  
    return streak;
  }
  
  module.exports = calculateStreak;
  