// utils/scoreCalculator.js
const calculateStreak = require('./streakCalculator');


module.exports = function calculateHabitScore(logs) {
    const relevantLogs = logs.filter(log => [0, 1, 2].includes(log.score));
  
    if (relevantLogs.length === 0) return null;
  
    const totalPoints = relevantLogs.reduce((sum, log) => sum + log.score, 0);
    const average = totalPoints / relevantLogs.length;
  
    const streak = calculateStreak(logs); // Assume you import this or add logic
    let badge = null;
    if (streak >= 14) badge = "🧠 Streak Lord";
    else if (streak >= 7) badge = "🔥 Momentum";
    else if (streak >= 3) badge = "🟡 Starter";
  
    // Group logs by week number (for score trends)
    const scoreByWeek = {};
    relevantLogs.forEach(log => {
      const week = getISOWeek(log.date); // Assume this returns 'YYYY-WW'
      if (!scoreByWeek[week]) scoreByWeek[week] = [];
      scoreByWeek[week].push(log.score);
    });
  
    const scoreTrend = Object.entries(scoreByWeek).map(([week, scores]) => ({
      week,
      average: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    }));
  
    return {
      average: +average.toFixed(2),
      totalLogged: relevantLogs.length,
      totalOffDays: logs.filter(log => log.score === 'f').length,
      streak,
      badge,
      scoreTrend
    };
  };
  
  function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return `${d.getFullYear()}-W${String(1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)).padStart(2, '0')}`;
  }
  