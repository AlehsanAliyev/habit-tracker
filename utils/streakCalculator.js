const SCORE_PRIORITY = new Map([
  ['f', 0],
  [0, 1],
  [1, 2],
  [2, 3]
]);

function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return new Date(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeLocalYMD(value) {
  const date = parseLocalDate(value);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDailyScoreMap(logs = []) {
  const byDay = new Map();
  logs.forEach((log) => {
    const key = normalizeLocalYMD(log.date);
    if (!key) return;
    const currentScore = byDay.get(key);
    const nextScore = log.score;
    const currentPriority = SCORE_PRIORITY.get(currentScore);
    const nextPriority = SCORE_PRIORITY.get(nextScore);
    if (nextPriority === undefined) return;
    if (currentPriority === undefined || nextPriority > currentPriority) {
      byDay.set(key, nextScore);
    }
  });
  return byDay;
}

function findLatestLoggedDate(scoreMap, today) {
  const todayKey = normalizeLocalYMD(today);
  if (!todayKey || scoreMap.size === 0) return null;
  const keys = Array.from(scoreMap.keys()).sort().reverse();
  const match = keys.find(key => key <= todayKey);
  return match ? parseLocalDate(match) : null;
}

function calculateActivityStreak(scoreMap, today) {
  let streak = 0;
  let cursor = findLatestLoggedDate(scoreMap, today);

  while (cursor) {
    const key = normalizeLocalYMD(cursor);
    const score = scoreMap.get(key);

    if (score === undefined) break; // UNLOGGED stops
    if (score === 'f') {
      cursor.setDate(cursor.getDate() - 1);
      continue; // OFF skips
    }
    if (score === 0) break; // MISSED breaks
    if (score === 1 || score === 2) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

function calculateDoneStreak(scoreMap, today) {
  let streak = 0;
  let cursor = findLatestLoggedDate(scoreMap, today);

  while (cursor) {
    const key = normalizeLocalYMD(cursor);
    const score = scoreMap.get(key);

    if (score === undefined) break; // UNLOGGED stops
    if (score === 'f') {
      cursor.setDate(cursor.getDate() - 1);
      continue; // OFF skips
    }
    if (score === 0) break; // MISSED breaks
    if (score === 1) break; // PARTIAL stops done-only streak
    if (score === 2) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

function calculateStreaks(logs = [], today = new Date()) {
  const scoreMap = buildDailyScoreMap(logs);
  return {
    activityStreak: calculateActivityStreak(scoreMap, today),
    doneStreak: calculateDoneStreak(scoreMap, today)
  };
}

function getStartOfISOWeek(dateValue) {
  const date = parseLocalDate(dateValue) || new Date();
  const day = date.getDay() || 7;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(date.getDate() - day + 1);
  return start;
}

module.exports = {
  normalizeLocalYMD,
  buildDailyScoreMap,
  calculateStreaks,
  getStartOfISOWeek
};
