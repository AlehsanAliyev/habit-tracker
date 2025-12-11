# Habit Tracker App

Goal-oriented habit tracker with dashboards, analytics, journaling, and a lightweight daily task list. Users track habits by frequency, log scores, review 7/30 day trends and admins curate suggested habits and monitor activity.

---

## Features

### User
- Session-based auth (login/register/logout)
- Habits: create/edit/delete with daily/weekly/monthly frequency and optional weekly target, last-7-day heatmap
- Logging: statuses completed/partial/off/missed mapped to scores 2/1/f/0; duplicate daily logs blocked
- Analytics: completion %, average score, streaks/badges, best/worst callouts, sort by completion/average/streak, 7 or 30 day range, heatmaps and sparkline trends (Chart.js)
- Journaling: morning/evening notes per day; list/add/edit/delete
- Today's tasks: simple to-do list with add/toggle/delete for the current day

### Admin
- User list with per-user habit view
- Suggested habits: create/manage templates users can add
- Admin analytics: total users/logs and top 5 active users

---

## Tech Stack
- Node.js + Express 5, Handlebars templates, custom CSS
- MongoDB with Mongoose models for users, habits, logs, journals, tasks, suggested habits
- express-session + connect-flash for auth state/messages; bcryptjs for hashing; dotenv for config
- Chart.js for analytics visuals

---

## Getting Started
1. Prerequisites: Node.js, npm, MongoDB (local or Atlas)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add a `.env` in the project root:
   ```
   SESSION_SECRET=yourSecretKey
   MONGO_URI=yourMongoDBConnectionString
   PORT=3000
   ```
4. Run the app:
   ```bash
   node app.js
   ```
   Visit http://localhost:${PORT || 3000}

---

## Navigation Guide
- `/` home landing
- Auth: `/login`, `/register`, `/logout`
- Habits dashboard: `/habits` (quick log buttons, last-7 heatmaps)
- Logging: `/logs` history; `/logs/add/:habitId` to log today
- Analytics: `/habits/analytics?range=7|30&sort=completion|average|streak`
- Suggestions: `/habits/suggested`, `/habits/add-from-suggestion`
- Journal: `/journal`, `/journal/add`, `/journal/edit/:id`
- Tasks: `/tasks` today's tasks add/toggle/delete
- Admin: `/admin` user list + per-user habits; `/admin/suggested`; `/admin/analytics`

---

## Data Model Snapshot
- Habit: title, frequency (daily/weekly/monthly), weeklyTarget, user
- Log: habit, user, date, status (completed/partial/off/missed), score (2/1/0/'f')
- Journal: user, date, morningNote, eveningNote (timestamps enabled)
- Task: user, title, isCompleted, date (midnight for daily grouping)
- SuggestedHabit: title, frequency, createdBy
- User: username, email, password, role (user|admin)

---

## Utilities
- `migrateLogs.js`: backfills `score` for legacy log docs using `MONGO_URI` or defaults to `mongodb://localhost:27017/HabitTracker`.
