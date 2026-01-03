// utils/scoreCalculator.js
const {
  buildDailyScoreMap,
  calculateStreaks,
  getStartOfISOWeek,
  normalizeLocalYMD
} = require('./streakCalculator');

module.exports = function calculateHabitScore(logs, options = {}) {
  const { weeklyTarget = 0, today = new Date(), useDailyAverage = false } = options;
  const relevantLogs = logs.filter(log => [0, 1, 2].includes(log.score));

  if (relevantLogs.length === 0) return null;

  let average;
  if (useDailyAverage) {
    const dailyMap = buildDailyScoreMap(logs);
    const dailyScores = Array.from(dailyMap.values()).filter(score => [0, 1, 2].includes(score));
    const total = dailyScores.reduce((sum, score) => sum + score, 0);
    average = dailyScores.length ? total / dailyScores.length : 0;
  } else {
    const totalPoints = relevantLogs.reduce((sum, log) => sum + log.score, 0);
    average = totalPoints / relevantLogs.length;
  }

  const { activityStreak, doneStreak } = calculateStreaks(logs, today);
  let badge = null;
  if (activityStreak >= 14) badge = "Streak Lord";
  else if (activityStreak >= 7) badge = "Momentum";
  else if (activityStreak >= 3) badge = "Starter";

  const dailyMap = buildDailyScoreMap(logs);
  const startOfWeek = getStartOfISOWeek(today);
  let successDays = 0;

  for (let i = 0; i < 7; i++) {
    const cursor = new Date(startOfWeek);
    cursor.setDate(startOfWeek.getDate() + i);
    const key = normalizeLocalYMD(cursor);
    const score = dailyMap.get(key);
    if (score === 1 || score === 2) successDays += 1;
  }

  const weeklyGoalProgress = weeklyTarget
    ? Math.min(successDays / weeklyTarget, 1)
    : 0;
  const weeklyCalendarCompletion = successDays / 7;

  // Group logs by week number (for score trends)
  const scoreByWeek = {};
  relevantLogs.forEach(log => {
    const week = getISOWeek(log.date);
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
    activityStreak,
    doneStreak,
    badge,
    scoreTrend,
    weeklyGoalProgress,
    weeklyCalendarCompletion,
    successDays,
    weeklyTarget
  };
};

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${String(1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)).padStart(2, '0')}`;
}
