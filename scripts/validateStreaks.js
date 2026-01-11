const { calculateStreaks, buildDailyScoreMap } = require('../utils/streakCalculator');
const calculateHabitScore = require('../utils/scoreCalculator');

const logs = [
  { date: '2025-01-08', score: 2 },
  { date: '2025-01-07', score: 'f' },
  { date: '2025-01-06', score: 1 },
  { date: '2025-01-05', score: 0 },
  { date: '2025-01-03', score: 2 }
];

const today = new Date('2025-01-08T12:00:00');
const scoreMap = buildDailyScoreMap(logs);
const streaks = calculateStreaks(logs, today);
const stats = calculateHabitScore(logs, { weeklyTarget: 4, today });

console.log('Daily map:', Array.from(scoreMap.entries()));
console.log('Streaks:', streaks);
console.log('Weekly stats:', {
  successDays: stats.successDays,
  weeklyGoalProgress: stats.weeklyGoalProgress,
  weeklyCalendarCompletion: stats.weeklyCalendarCompletion
});
